import { Inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import { findPath, path2FieldInfo } from "@gs/gdk/utils/field";
import {ReportUtils} from "@gs/report/utils";
import { DescribeService } from "@gs/gdk/services/describe";
import {HttpProxyService} from "@gs/gdk/services/http";
import { map, publishReplay, refCount, switchMap, filter } from "rxjs/operators";
// import {
//   LIBS_API_ENDPOINTS,
//   PageContext,
//   SummaryWidget,
//   WidgetCategory,
//   WidgetCategoryType,
//   WidgetCategorytooltipType,
//   transformWidgetCategory,
//   Cs360ContextUtils,
//   FieldTreeViewOptions,
//   ADMIN_CONTEXT_INFO,
//   IADMIN_CONTEXT_INFO
// } from '@gs/cs360-lib/src/common';
import { SummaryWidget, WidgetCategory, WidgetCategoryType, WidgetCategorytooltipType } from '../pojo';
import {PageContext} from '../cs360.constants';
import { LIBS_API_ENDPOINTS } from '../cs360.constants';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '../admin.context.token';
import { transformWidgetCategory } from '../utils';
import { FieldTreeViewOptions } from '../pojo/field-tree-view-wrapper.interface';
import { BehaviorSubject, forkJoin, of } from "rxjs";
import { ReportsConfigurationService } from '@gs/report/reports-configuration';
import { find, groupBy, filter as lodashFilter } from 'lodash';
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({ providedIn: 'root' })
export class SummaryConfigurationService {

  private _widgetCategories: BehaviorSubject<Array<WidgetCategory>> = new BehaviorSubject<Array<WidgetCategory>>(null);
  private _widgetListLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private widgetCategoryList: WidgetCategory[] = [] as WidgetCategory[];

  attributeWidgetGridResize: BehaviorSubject<Array<WidgetCategory>> = new BehaviorSubject<any>(null);
  summaryBootstrapData: any = {};
  objectmetadata: any = {}
  constructor(private http: HttpProxyService, private ds: DescribeService, private reportsConfigurationService: ReportsConfigurationService, @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO, private translocoService: TranslocoService, private i18nService:  NzI18nService) { }

  get widgetCatgories(): BehaviorSubject<Array<WidgetCategory>> {
    return this._widgetCategories;
  }

  get widgetListLoading() {
    return this._widgetListLoading;
  }

  setWidgetListLoading(value: boolean) {
    this._widgetListLoading.next(value);
  }

  setWidgetCategories(widgets) {
    this.widgetCategoryList = widgets;
    this._widgetCategories.next(widgets);
  }

  getMaxWidgetAllowed(): number {
    return this.summaryBootstrapData.widgetLimit || 30;
  }

  getobjectmetadata(){
  return this.objectmetadata;
  }

  getMaxAttributesAllowedInAttributeWidget(): number {
    return this.summaryBootstrapData.attributeWidgetFieldsLimit || 15;
  }

  getAttributeNameLimit() {
    return this.summaryBootstrapData.widgetNameCharLimit || 90;
  }

  getAttributeDescriptionLimit() {
    return this.summaryBootstrapData.widgetDescCharLimit || 90;
  }

  getAttributeWidgetSupportedDataTypes() {
    return this.summaryBootstrapData.attributeWidgetAllowedDataTypes || ['BOOLEAN', 'EMAIL', 'STRING', 'PICKLIST', 'LOOKUP', 'NUMBER', 'CURRENCY'];
  }

  getFieldWidgetSupportedDataTypes() {
    return this.summaryBootstrapData.fieldWidgetAllowedDataTypes || ['BOOLEAN', 'EMAIL', 'STRING', 'PICKLIST', 'RICHTEXTAREA', 'LOOKUP', 'NUMBER', 'CURRENCY'];
  }

  getLookupLevel() {
    return this.summaryBootstrapData.lookuplevel || 2;
  }

  setFieldPath(field) {
    const path = findPath(field);
    if (field.data) {
      const fieldInfo = path2FieldInfo(path, {},true);
      field.data.fieldPath = fieldInfo ? fieldInfo.fieldPath : undefined;
    }
  }

  getWidgetList(isPartner?: boolean) {
    if (this.widgetCategoryList && this.widgetCategoryList.length) {
      return false;
    }
    this.setWidgetListLoading(true);
    // const areaName = Cs360ContextUtils.getAreaName(this.ctx) as string;
    let areaName = this.ctx.pageContext.toLowerCase();
    areaName = isPartner ? 'partner_' + areaName : areaName;
    this.http.get(LIBS_API_ENDPOINTS.GET_SUMMARY_WIDGETS(areaName)).pipe(switchMap((response) => {
      this.summaryBootstrapData = response.data || {};
      const data = (response.data && response.data.widgets || []).map((category: WidgetCategory) => {
        const { widgetCategory } = category;
        category.isLoading = true;
        if (widgetCategory === WidgetCategoryType.STANDARD) {
          const options = transformWidgetCategory(category);
          return { 
            ...options,
            active: true,
            treeOptions: {
              ...options.treeOptions,
              isDataTypeIconRequired: false
            }
          };
        } else if(widgetCategory === WidgetCategoryType.REPORT) {
          return category;
        } else {
          return category;
        }
      });
      this.setWidgetCategories(data);
      this.setWidgetListLoading(false);
      return this.getSubscriptionForReportAndField(data).pipe(map(([reportReponse, fieldResponse]) => {
        const { children } = reportReponse as any;
        const fields = fieldResponse as any;
        return this.widgetCategoryList.map((category: WidgetCategory) => {
          const { widgetCategory } = category;
          if (widgetCategory === WidgetCategoryType.REPORT) {
            category.widgets = children || [];
          } else if (widgetCategory === WidgetCategoryType.FIELD) {
            category.widgets = fields || [];
          } else {
            return category;
          }
          return transformWidgetCategory(category);
        });
      }));
    }), publishReplay(1), refCount()).subscribe((value) => {
      this.setWidgetCategories(value);
    });
  }

  getSubscriptionForReportAndField(data) {
    const reportCategory = find((data), (value) => value.widgetCategory === WidgetCategoryType.REPORT);
    const fieldCategory = find((data), (value) => value.widgetCategory === WidgetCategoryType.FIELD);
    let subs = [];

    if (reportCategory) {
      subs.push(this.getSubscription(WidgetCategoryType.REPORT));
    } else {
      subs.push(of([]));
    }
    if (fieldCategory) {
      subs.push(this.getSubscription(WidgetCategoryType.FIELD));
    } else {
      subs.push(of([]));
    }
    return forkJoin(subs);
  }

  getSubscription(widgetCategoryType: WidgetCategoryType) {
    if (widgetCategoryType === WidgetCategoryType.REPORT) {
      // if(this.ctx.pageContext === PageContext.C360 || (this.ctx.pageContext === PageContext.R360 && !this.ctx.relationshipTypeId)) {
      if(!this.ctx.standardLayoutConfig.groupByType || !this.ctx[this.ctx.standardLayoutConfig.groupByType.typeId]) {
        return this.reportsConfigurationService.fetchReportsByObjects();
      } else {
        return of({});
      }
    }
    else {
      return this.getDescribedObject({
        host: ReportUtils.getFieldTreeHostInfo({
          "objectName": this.ctx.baseObject,
          "objectLabel": this.i18nService.translate(this.ctx.translatedBaseObjectLabel),
          "connectionType": "MDA",
          "connectionId": "MDA",
          "dataStoreType": "HAPOSTGRES"
        }),
        maxNestLevels: 2,
        fieldInfo: [],

      } as FieldTreeViewOptions);
    }
  }

  getResolvedwidgetCategories() {
    return this.widgetCatgories.pipe(filter(widgetCategories => {
      if (!widgetCategories) {
        return false;
      }
      if (find(widgetCategories, wc => wc.isLoading))
        return false;
      else
        return true;
    })).pipe(map(x => {
      return groupBy(x, 'widgetCategory');
    }));
  }


  getDescribedObject(treeOptions: FieldTreeViewOptions) {
    const allowedDataTypes = this.getFieldWidgetSupportedDataTypes();
    const {
      allowedFields,
      honorCustomLookup,
      fieldSearchSetting,
      resolveMultipleLookups,
      host, maxNestLevels
    } = treeOptions;
    const otherAttributes = {
      allowedFields,
      filterFunction: (fields, allowedDataTypes, allowedFields, uniqKey) => {
        const op = lodashFilter(fields, (field) => allowedDataTypes.indexOf(field.dataType.toUpperCase()) > -1);
        return op;
      },
      skipFilter: true,
      honorCustomLookup,
      maintainDefaultOrder: fieldSearchSetting && fieldSearchSetting.maintainDefaultOrder,
      resolveMultipleLookups: resolveMultipleLookups && resolveMultipleLookups.resolve
    };
    return this.ds.getObjectTree(host, host.name, maxNestLevels, allowedDataTypes, otherAttributes as any).then(objectList => {
      this.objectmetadata = objectList.children;
      return objectList.children;
    });
  }

  raiseEventForAttributeGridResize(value) {
    this.attributeWidgetGridResize.next(value);
  }

}

/*@Pipe({
  name: 'widgetSourceLabel',
  pure: false
})
export class WidgetSourceLabelPipe implements PipeTransform {
  transform(widgetItem: SummaryWidget) {
    switch(widgetItem.widgetCategory) {
      case WidgetCategoryType.STANDARD: {

        return `${WidgetCategorytooltipType.STANDARD} Widget - ${(widgetItem.displayName) || widgetItem.subType}`;
      }
      case WidgetCategoryType.FIELD: {
          return this.getFieldLabel(widgetItem);
      }
      case WidgetCategoryType.REPORT: {
        return `${WidgetCategorytooltipType.REPORT} Widget - ${widgetItem.config && widgetItem.config.collectionDetail && widgetItem.config.collectionDetail.objectLabel} - ${(widgetItem.reportName || widgetItem.config && widgetItem.config.reportName)}`;
      }
    }
  }*/


