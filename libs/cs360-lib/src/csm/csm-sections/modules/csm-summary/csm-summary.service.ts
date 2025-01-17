import { EventEmitter, Inject, Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { groupBy, each, find,camelCase } from 'lodash';
import { EventType, WidgetItemSubType, WidgetItemType, CS360Service, API_ENDPOINTS, ObjectNames, PageContext, CONTEXT_INFO, ICONTEXT_INFO, IADMIN_CONTEXT_INFO, isMultiObject } from '@gs/cs360-lib/src/common';
import { CustomColumnChartOptions } from '../../../csm-widgets/modules/custom-column-chart-widget/custom-column-chart-widget.interface';
import { NzI18nService } from "@gs/ng-horizon/i18n";
import {HttpProxyService} from "@gs/gdk/services/http";


export interface SpAggregates{
  id: string;
  label: string;
  value: number;
}

// TODO: Move to appropriate place
export interface SPSummary {
  successPlanCount: number;
  openObjectivesCount: number;
  successPlanTypeId: string;
  successPlanTypeName: string;
  successPlanTypeColor: string;
}
export interface ActiveSPSummaryAPIContract {
  spAggregates: SpAggregates[];
  spSummaries: SPSummary[]
}

export interface PreviewCtx extends IADMIN_CONTEXT_INFO {
  cId?: string;
  rId?: string;
}

export interface ChartWidgetDataFormat {
  chartConfig: Highcharts.Options;
  [key: string]: any;
}

export interface OpenCTA {
  color: string;
  id: string;
  name: string;
  openCtaCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CsmSummaryService {

  sectionData: any;
  onAction: EventEmitter<any> = new EventEmitter();
  sectionDataMap = {};
  isPreviewMode: boolean = false;
  allAttributeWidgetConfig = {};
  constructor(private cS360Service: CS360Service,
    private http: HttpProxyService, @Inject(CONTEXT_INFO) public ctx: any,private i18nService: NzI18nService) { }

  /* This setter will be used to modify the ctx. This is introduced to be used in case of summary preview in admin. 
  By default, the ctx has type ICONTEXT_INFO.
  In case of admin context for summary preview, the ctx will be IADMIN_CONTEXT_INFO type. */
  setCtx(context: ICONTEXT_INFO | IADMIN_CONTEXT_INFO) {
    this.ctx = context;
  }

  dispatchWidgetEvents(event) {
    this.onAction.next(event);
  }

  get allCRWidgetconfigs(){
    return this.allAttributeWidgetConfig;
  }

  setSubjectForSectionWidgets(widgets, entityId: string, layoutId: string, sectionId: string, selectedCompanyId?: string, payload?: any) {
    const entityDetail = this.createEntitypayload(widgets, entityId, layoutId, sectionId, selectedCompanyId, payload);
    const sectionData = {};
    const types = groupBy(widgets, 'widgetType');
    each(Object.keys(types), (widgetType) => {
      sectionData[widgetType] = new BehaviorSubject({});
      this.requestDataByType(widgetType, entityDetail, types[widgetType], selectedCompanyId, payload).subscribe(data => {
        this.sectionDataMap[widgetType] = data;
        sectionData[widgetType].next(data);
      });
    });
    this.sectionData = sectionData;
  }

  /**8
   * Note: Here we merge Cr type widgets and MultiAttribute widget config in single object wise Config
   * as apyload to p360 attributes because we need to support multi object i.e {P:[],cp:[],rp:[]},
   *
   * For single object we only need sectionid so its not needed for that.
   */
  createEntitypayload(widgets, entityId, layoutId, sectionId, selectedCompanyId, payload) {
    // .map((attribute)=> attribute.config[0])
    let entityDetail = {};
    let crTypeWidgetsInfo = widgets.filter((data)=> data.subType === WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE || data.subType === WidgetItemSubType.TEXT)
    if (this.ctx.associatedObjects && this.ctx.associatedObjects.length && crTypeWidgetsInfo.length) {
      this.allAttributeWidgetConfig = this.mergeObjectsOfArrays(crTypeWidgetsInfo);
        entityDetail = {config: this.allAttributeWidgetConfig ,
                        "entityId": this.ctx.entityId || '',
                        "relationshipId": this.ctx.rId || '',
                        "companyId": this.ctx.cId || ''};
    }
    else {
        entityDetail = {
            entityId,
            layoutId,
            sectionId,
            scope: layoutId ? 'LOCAL' : 'GLOBAL',
            // objectName: this.ctx.pageContext === PageContext.C360 ? ObjectNames.COMPANY : ObjectNames.RELATIONSHIP,
            // entityTypeId: this.ctx.pageContext === PageContext.R360 ? this.ctx.relationshipTypeId: null
            objectName: this.ctx.baseObject,
            entityTypeId: this.ctx.relationshipTypeId
        };
    }
    return entityDetail;
}

/**
 * It merges multiple widget config in single config object of arrays so its a merge of multiple configs.
 */
mergeObjectsOfArrays(crTypeWidgetsInfo) {
  // As i added a text widget too so i create a predefined object array even attribute not available only text widget is there

  const mergedObject = {};
  // Structured this on basis on multi object
  isMultiObject(this.ctx) ?  [this.ctx.baseObject, ...this.ctx.associatedObjects].forEach((field)=>{
    mergedObject[field] = [];
  }) : mergedObject[this.ctx.baseObject] = [];

    crTypeWidgetsInfo.forEach((widgetInfo)=>{
      if(widgetInfo.subType === WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE){
        const obj = widgetInfo.config[0];
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (!mergedObject.hasOwnProperty(key)) {
              const isObject = typeof obj[key] === 'object';

              // NOTE:Values like 'axisDetails' and 'dimensionDetails' can be an empty object {}.
              // Destructuring an empty object will result in an javascript error.
              if(!isObject || (isObject && obj[key].length)){
                mergedObject[key] = [...obj[key]];
              } else {
                mergedObject[key] = [];
              }
            } else {
              mergedObject[key] = [...mergedObject[key], ...obj[key]];
            }
          }
        }
      }
      // For text widget config hold one field so we push field on same object
      if(widgetInfo.subType === 'TEXT'){
        const objectName = widgetInfo.config.objectName;
        mergedObject[objectName].push(widgetInfo.config);
      }
    })
    return mergedObject;
  }

  setPreviewMode() {
    this.isPreviewMode = true;
  }

  getIsPreviewMode() {
    return this.isPreviewMode;
  }

  isReadOnly() {
    return this.isPreviewMode || this.cS360Service.isReadOnly();
  }

  getDataForWidgetType(widgetType, entityDetail) {
    this.requestDataByType(widgetType, entityDetail).subscribe(data => {
      this.sectionData[widgetType].next(data);
    });
  }

  refreshWidgetType(widgetType) {
    this.sectionData[widgetType].next(this.sectionDataMap[widgetType]);
  }

  requestDataByType(widgetType, entityDetail, widgetList?: any[], selectedCompanyId?: string, payload?: any) {
    switch (widgetType) {
      case WidgetItemType.CR: {
        if(payload && payload.isPreview){
          return isMultiObject(this.ctx) ? this.cS360Service.getSectionData(entityDetail,this.ctx) : this.cS360Service.previewSaveSection(selectedCompanyId, payload);
        } else {
          return this.cS360Service.getSectionData(entityDetail);
        }
      }
      case WidgetItemType.COCKPIT: {
        return this.getDataForCockpitWidgets(entityDetail, widgetList);
      }
      case WidgetItemType.SP: {
        return this.getDataForSuccessPlanWidgets(entityDetail).pipe(map(res => {
          if (!widgetList) {
            return res.data;
          }
          return this.transformWidgetResponse(res.data, widgetList);
        }));
      }
      case WidgetItemType.LEADS: {
        return this.getLeadsCount(widgetList);
      }
      default: {
        return of(null)
      }
    }
  }

  transformWidgetResponse(data, widgetList) {
    const returnObj = {};
    each(widgetList, (type) => {
      returnObj[type.itemId] = this.transformDataBasedOnWidgetSubType(type.subType, data)
    });
    return returnObj;
  }

  private transformDataBasedOnWidgetSubType(subType: WidgetItemSubType, data: ActiveSPSummaryAPIContract) {
    switch (subType) {
      case WidgetItemSubType.ASP:
        const resData = data && data.spSummaries || [];
        // Dummy data for testing
        // [1,2,3,4,5,6,7,8].forEach(num => {
        //   resData.push({
        //     "successPlanCount": 1 * num,
        //     "openObjectivesCount": 2 * num,
        //     "successPlanTypeId": "1I00640EK7ANCTR7A4UA412GOR85SMPFZ8I4" + num,
        //     "successPlanTypeName": "Azhar " + num
        //   })
        // })
        const activePlanData = (resData as SPSummary[]).map(item => ({ name: item.successPlanTypeName, y: item.successPlanCount }));
        const openPlanData = (resData as SPSummary[]).map(item => ({ name: item.successPlanTypeName, y: item.openObjectivesCount }));
        const maxDataPoint = Math.max(...activePlanData.map(item => item.y), ...openPlanData.map(item => item.y), 1);

        return ({
          data: resData,
          labelProp: 'successPlanTypeName',
          valueProps: ['successPlanCount', 'openObjectivesCount'],
          legends: ['Active Plan', 'Open Objective'],
          colors: ['#43ade5', '#96d1f3'],
          maxDataPoint,
          groupItemSpacing: '2px',
          spacing: '20px',
          colWidth: '8px',
        } as CustomColumnChartOptions)
      case WidgetItemSubType.SP: {
        return data.spAggregates;
      }
      case WidgetItemSubType.CASE: {
        return [
          { label: 'Open Cases', value: 2 },
          { label: 'Overdue', value: 0 },
        ];
      }
      default:
        return null;
    }
  }

  getData(type: WidgetItemType): Observable<any> {
    return this.sectionData[type];
  }

  saveAttribute(payload, entityId: string, entityType: string, dataEditEntityId: string,multiAttributeData?:any) {
    this.dispatchWidgetEvents({ eventType: EventType.SAVE, contextCategory: WidgetItemType.CR, data: payload, entityId, entityType, dataEditEntityId, multiAttributeData });
  }

  saveAndGetDataForWidgetType(payload) {
    const fieldLabel =  payload.data && payload.data.fieldLabel;
    delete payload.data.fieldLabel;
    this.cS360Service.saveAttributeAndGetData(payload).subscribe(response => {
      if (response.result) {
        this.sectionDataMap[WidgetItemType.CR] = response.data && response.data[0];
        this.sectionData[WidgetItemType.CR].next(this.sectionDataMap[WidgetItemType.CR]);
        // this.toastMessageService.add(`${fieldLabel} updated successfully`, MessageType.SUCCESS, null, { duration: 5000 });
        this.cS360Service.createNotification('success', `${fieldLabel} ` + this.i18nService.translate('360.csm.update_success'), 5000);
      } else {
        const message = response.error && response.error.message || this.i18nService.translate('360.admin.APPLICATION_MESSAGES.DEFAULT_ERROR_MESSAGE');
        this.dispatchWidgetEvents({ eventType: EventType.ERROR, contextCategory: WidgetItemType.CR, message });
      }
    })
  }

  getDataForSuccessPlanWidgets(entityDetail) {
    // const et = this.ctx.pageContext === 'C360' ? 'COMPANY' : 'RELATIONSHIP';
    const et = this.ctx.baseObject.toUpperCase();
    return this.http.get(API_ENDPOINTS.GET_SP(entityDetail.entityId, et));
  }

  getDataArrWithHistory(payload, isUpdate?: boolean){
    return this.http.post(API_ENDPOINTS.ARR_WITH_HISTORY, payload);
  }

  getDataForCockpitWidgets(entityDetail, widgetList) {
    let subscriptions = [];
    const cockpitCTAWidget = find(widgetList, (val) => val.subType === WidgetItemSubType.COCKPIT_CTA); //insights widget
    const cockpitWidget = find(widgetList, (val) => val.subType === WidgetItemSubType.COCKPIT);
    subscriptions.push((cockpitCTAWidget ? this.getCockpitWidgetData(cockpitCTAWidget.config, entityDetail) : of([])));
    subscriptions.push((cockpitWidget ? this.getOpenCTA(entityDetail) : of([])));

    const response = new Observable(observer => {
      forkJoin(subscriptions).subscribe(([cockpitCTAWidgetResponse, cockpitWidgetResponse]) => {
        const responseObj = {};
        if (cockpitCTAWidget && cockpitCTAWidget.itemId) {
          const itemData = ((cockpitCTAWidgetResponse as any) || []).map(x => {
            return {
              label: x.name,
              value: x.value
            };
          });
          responseObj[cockpitCTAWidget.itemId] = itemData;
        }
        if (cockpitWidget && cockpitWidget.itemId) {
          responseObj[cockpitWidget.itemId] = cockpitWidgetResponse;
        }
        observer.next(responseObj);
        observer.complete();
      });
    });
    return response;
  }

  getOpenCTA(entityDetail) {
    // const et = this.ctx.pageContext === 'C360' ? 'COMPANY' : 'RELATIONSHIP';
    const et = this.ctx.baseObject.toUpperCase();
    return this.http.get(API_ENDPOINTS.GET_OPEN_CTAS(entityDetail, et))
      .pipe(
        map(res => {
          let data: OpenCTA[] = res.data || [];
          // Dummy data for testing
          // data = [
          //   { "id": "1I00650WACZ7F0X9HR0IGG8DNDJ25GM89N8E", "name": "1test", "color": "#C2FFE6", "openCtaCount": 1},
          //   { "id": "1I00650WACZ7F0X9HR2TFS70I5CG5Z5OM08B", "name": "Lifecycle", "color": "#DDFF95", "openCtaCount": 5},
          //   { "id": "1I00650WACZ7F0X9HR5ZP5NXJVI1I2KDQCRY", "name": "Follow up", "color": "#16FFFB", "openCtaCount": 3},
          //   { "id": "1I00650WACZ7F0X9HR79PBBK2QE92JIRXC43", "name": "Activity", "color": "#FEFF79", "openCtaCount": 6},
          //   { "id": "1I00650WACZ7F0X9HRCGLK7OE3QIUMJXLGD3", "name": "Risk", "color": "#FFDBDB", "openCtaCount": 2},
          //   { "id": "1I00650WACZ7F0X9HRH89GPY647AN1ADRWRG", "name": "Expansion", "color": "#C2FFE6", "openCtaCount": 1},
          //   { "id": "1I00650WACZ7F0X9HRJ1M68DELNDX2BRN28L", "name": "Opprtunity", "color": "#C2FFE6", "openCtaCount": 2},
          //   { "id": "1I00650WACZ7F0X9HRJJ4RGQ644GYCN44QNF", "name": "Product Risk", "color": "#FF9BEC", "openCtaCount": 4},
          //   { "id": "1I00650WACZ7F0X9HRPTU778M8AVCOQPRP3D", "name": "Ref Request", "color": "#FFDBDB", "openCtaCount": 3}
          // ]
          // const openCtaData = data.map(item => ({
          //   name: item.name,
          //   y: item.openCtaCount,
          //   color: item.color
          // }));
          const maxDataPoint = Math.max(...data.map(item => item.openCtaCount)) + 1;

          return ({
            data,
            maxDataPoint,
            labelProp: 'name',
            valueProps: ['openCtaCount'],
            spacing: '24px',
            colWidth: '14px'
          } as CustomColumnChartOptions)
        })
      );
  }

  getCockpitWidgetData(ids, entityDetail) {
    const payload = {
      ids: (ids || []).map(x => x.id),
      filters: {
        expression: "CA",
        conditions: [{
          leftOperand: {
            type: "DIMENSION",
            fieldName: "Gsid",
            objectName: entityDetail.objectName || 'COMPANY'
          },
          filterAlias: "CA",
          comparisonOperator: "EQ",
          rightOperandType: "VALUE",
          filterValue: { value: [entityDetail.entityId] }
        }]
      }
    };
    const qpObject = {
      // et: this.ctx.pageContext === PageContext.C360 ? 'COMPANY' : 'RELATIONSHIP',
      et : this.ctx.baseObject.toUpperCase(),
      etId: this.ctx.relationshipTypeId,
      id: this.ctx.cId
    };
    return this.http.post(API_ENDPOINTS.GET_CTA(qpObject), payload).pipe(map(x => x.data));
  }

  getDataForCaseWidgets(payload) {
    return this.http.post(API_ENDPOINTS.GET_CASES, payload).pipe(map(x => x.data || []));
  }

  removeImage({entityId, object, fieldName}) {
    const payload = {};
    this.http.delete(API_ENDPOINTS.DELETE_IMAGE(object, entityId, fieldName || 'Logo'), payload).subscribe(response => {
      if (response.result) {
        this.dispatchWidgetEvents({ eventType: EventType.REFRESH, contextCategory: WidgetItemType.CR });
      } else {
        const message = response.error && response.error.message || this.i18nService.translate('360.admin.APPLICATION_MESSAGES.DEFAULT_ERROR_MESSAGE');
        this.dispatchWidgetEvents({ eventType: EventType.REFRESH, contextCategory: WidgetItemType.CR, message });
      }
    });
  }

  dispatchWidgetEvent(event) {
    this.dispatchWidgetEvents(event);
  }

  getLeadsCount(widgetList: any[]) {
    let condition;
    const rid = this.ctx.rId || window['GS'].relationshipId;
    const cid = this.ctx.cId || window['GS'].companyId;

    if (this.ctx.pageContext === PageContext.C360) {
      condition = {
        "comparisonOperator": "EQ",
        "filterAlias": "A",
        "filterValue": {
          "value": [cid]
        },
        "leftOperand": {
          "objectLabel": "Customer Success Lead",
          "objectName": "gs_lead",
          "dataType": "LOOKUP",
          "dbName": "company",
          "fieldName": "Company",
          "fieldPath": null,
          "key": "Company",
          "label": "Company",
          "properties": {
            "pathLabel": "Company",
            "SEARCH_CONTROLLER": "AUTO_SUGGEST",
            "sourceType": "GSID"
          },
          "type": "BASE_FIELD"
        },
        "rightOperandType": "VALUE",
        "fromUI": true
      }
    } else if (this.ctx.pageContext === PageContext.R360) {
      condition = {
        "comparisonOperator": "EQ",
        "filterAlias": "A",
        "filterValue": {
          "value": [rid]
        },
        "leftOperand": {
          "objectLabel": "Customer Success Lead",
          "objectName": "gs_lead",
          "dataType": "LOOKUP",
          "dbName": "relationship",
          "fieldName": "Relationship",
          "fieldPath": null,
          "key": "Relationship",
          "label": "Relationship",
          "properties": {
            "pathLabel": "Relationship",
            "SEARCH_CONTROLLER": "AUTO_SUGGEST",
            "sourceType": "GSID"
          },
          "type": "BASE_FIELD"
        },
        "rightOperandType": "VALUE",
        "fromUI": true
      }
    }

    const itemId = widgetList[0].itemId;
    const payload = {
      "objectName": "gs_lead",
      "fields": [
        {
          "type": "MEASURE",
          "fieldName": "Amount",
          "dataType": "CURRENCY",
          "objectName": "gs_lead",
          "properties": {
            "required": false,
            "updatable": true
          },
          "displayOrder": 5,
          "aggregateFunction": "SUM",
          "fieldAlias": "Sum of Amount in gs_lead"
        }
      ],
      "orderByFields": [],
      "whereClause": null,
      "wrapFilterConfiguration": {
        "globalFilter": {
          "conditions": [ condition],
          "expression": "A"
        },
        "tableFilter": null,
        "type": "NONE"
      },
      "customSort": null,
      "new": false
    };
    return this.http.post(API_ENDPOINTS.GET_LEADS_COUNT, payload)
        .pipe(map(res => {
          return {
            [itemId]: res.data || {}
          }
        }));
  }

   /***
     * We need payload with all CR type object wise widget config so we construct this payload for that
     * for single object we honor same old approach where we depend on sectionId
     */
    getMultiAttributeWidgetPayload(event){
      let objectGsidKey = event.item.objectName + '.Gsid';
      const valueFieldKey = event.item.objectName + '.' + event.item.fieldName;
          return {
              "updateRecord": {
                  [objectGsidKey]: this.ctx[camelCase(objectGsidKey)] || this.ctx.entityId,
                  [valueFieldKey]: event.payload[event.item.fieldName]
              },
              "multiObjectConfig": {
                  "config": this.allCRWidgetconfigs,
                  "entityId": this.ctx.entityId || '',
                  "relationshipId": this.ctx.rId || '' ,
                  "companyId": this.ctx.cId || ''
              },
              "objectName": event.item.objectName
          }
    }
}


