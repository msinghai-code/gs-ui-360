import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {isEmpty} from "lodash";
import { StateAction } from '@gs/gdk/core';
// import { IReportFilter, PopoverComponent} from "@gs/core";
import { isValidHTMLTagFromString } from "@gs/gdk/utils/common";
import { ALLOWED_HTML_TAG_FOR_STRING_DTS } from '@gs/gdk/grid';
import {CONTEXT_MENU_INFO, RELTYPE_ROW_IDENTIFIER_KEY, ROW_IDENTIFIER_KEY} from "../csm-relationship.constants";
import {CsmRelationshipService} from "../csm-relationship.service";
import { CS360Service } from '@gs/cs360-lib/src/common';
import { PageContext } from '@gs/cs360-lib/src/common';
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import {NzI18nService} from "@gs/ng-horizon/i18n";
@Component({
  selector: 'gs-relationship-card',
  templateUrl: './relationship-card.component.html',
  styleUrls: [
    './relationship-card.component.scss'
  ]
})
export class RelationshipCardComponent implements OnInit {

  @Input() configs: any;  //{ columns: [], baseObjectName: "", whereClause: {}  }

  @Input() options: any;

  @Output() action = new EventEmitter<StateAction>();

  @ViewChild("contextMenuGrid", { static:true }) contextMenuGrid: NzOverlayComponent;

  public relationshipData = Array.from({length : 7});
  public cardDataList: any[] = [];
  public contextMenuInfo;
  public showMore: boolean;
  public customPaginator = {
    recordType: 'records',
    pageSizes: [50, 100, 200],
    pageSize: 50,
    fromRecord: 0,
    toRecord: 0,
    totalRecords: 50,
    nextPageSize: null,
    currentPageSize: 30,
    nextAvailable: false,
    onDemand: true,
    descriptionText: this.nzi18nService.translate('360.admin.relationship_form.descText'),
    currentPageNum: 1
  }
  public pageSize: number = 50;
  public showNoData = false;
  private _data: any[];

  constructor(private csmRelationshipService: CsmRelationshipService,
    private c360Service: CS360Service, private nzi18nService: NzI18nService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.bootstrapComponent();
    this.fetchCardViewData();
  }

  bootstrapComponent() {
    this.contextMenuInfo = this.setAllowedContextMenuInfo();
    const { actionsPermissionSet } = this.options;
    this.showMore = actionsPermissionSet.edit || actionsPermissionSet.delete;
  }

  fetchCardViewData() {
    this.emitEvent({type: "SHOW_LOADER", payload: true});
    const payload = this.constructPayload();
    this.csmRelationshipService
        .fetchRelationshipsListViewData(payload)
        .subscribe((card: any) => {
          this.emitEvent({type: "SHOW_LOADER", payload: false});
          if(!isEmpty(card)) {
            this._data = card.data;
            this.cardDataList = this.processData(card.data);
            this.showNoData = !this._data.length;
            this.preparePaginationDescription(card.data.length, card.pageInfo);
          } else {
            this._data = [];
            this.showNoData = true;
            this.cardDataList = this.processData(card.data);
          }
        });
  }

  trackBy(index: number, card: any) {
    return card.rowIdentifierGSID.k;
  }

  private processData(data) {
    const { columns } = this.configs;
    const nameField = columns.find(c => c.fieldName === 'Name');
    return data.map((d: any) => {
            return {
              items: this.cardDetails(d),
              name: !!nameField ? (d[nameField.itemId].fv || d[nameField.itemId].v): 'NA',
              [ROW_IDENTIFIER_KEY]: d[ROW_IDENTIFIER_KEY] ? d[ROW_IDENTIFIER_KEY]: {},
              [RELTYPE_ROW_IDENTIFIER_KEY]: d[RELTYPE_ROW_IDENTIFIER_KEY] ? d[RELTYPE_ROW_IDENTIFIER_KEY]: {}
            }
          });

  }

  private cardDetails(data: any) {
    const { columns } = this.configs;
    return columns.reduce((acc: any, col: any) => {
        if(!col.hidden) {
            const { fieldName, label, dimensionDetails, axisDetails, objectName, itemId, dataType } = col;
            let translatedValue;
            if(data[itemId].fv === true || data[itemId].v === true){
                translatedValue = data[itemId].fv = data[itemId].v =  this.nzi18nService.translate('360.admin.boolean_options.true');
            } else if(data[itemId].fv === false || data[itemId].v === false) {
                translatedValue = data[itemId].fv = data[itemId].v = this.nzi18nService.translate('360.admin.boolean_options.false');
            } else {
                translatedValue = data[itemId].fv || data[itemId].v;
            }
            const nodesList = isValidHTMLTagFromString(translatedValue, ALLOWED_HTML_TAG_FOR_STRING_DTS.join(', '));
            acc.push({
                fieldName, label, objectName, itemId, dataType,
                ...dimensionDetails,
                ...axisDetails,
                complexValue: data[itemId],
                value: translatedValue || data[itemId].fv || data[itemId].v,
                meta:{...col.meta, validTag:nodesList.length ? true : false}
            });
        }
        this.cdr.detectChanges();
      return acc;
    }, []);
  }

  private constructPayload() {
    const { currentPageSize, currentPageNum } = this.customPaginator;
    const newColumns = this.configs.columns.concat([{
      dataType: "GSID",
      dbName: "gsid",
      fieldName: "Gsid",
      itemId: "rowIdentifierGSID",
      label: "GSID",
      objectName: "relationship"
    }, {
      dataType: "LOOKUP",
      fieldName: "TypeId",
      itemId: "rowIdentifierRelTypeGSID",
      label: "Type Id",
      objectName: "relationship"
    }]);
    return {
      ...this.configs,
      columns: newColumns,
      limit: currentPageSize,
      offset: (currentPageNum - 1) * currentPageSize
    };
  }

  public onAction(evt: StateAction) {
    const { type, payload } = evt;
    switch(type) {
      case 'REL_NAME_CLICK':
        this.c360Service.set360ToRender({id: payload.target.complexValue.k, pageContext: PageContext.R360});
        break;
      case 'MORE_OPTIONS':
        (<any>this.contextMenuGrid).clickedRowData = payload;
        this.contextMenuGrid.open(new ElementRef(payload.target));
        break;
      default: null
    }
  }

  public onContextMenuAction(evt: any, label: string) {
    const { items, identifier } = (<any>this.contextMenuGrid).clickedRowData;
    let payload = items.reduce((acc, curr) => {
      acc[curr.itemId] = curr.complexValue;
      return acc;
    }, {});
    if(!isEmpty(identifier)) {
      payload = {...payload, ...identifier};
    }
    this.action.emit({
      type: label,
      payload
    });
  }

  public refresh(config: {filters: any, orderBy: any}) {
    this.configs.whereClause = config.filters;
    this.configs.orderBy = config.orderBy;
    this.fetchCardViewData();
  }

  private emitEvent(evt: StateAction) {
    this.action.emit(evt);
  }

  private setAllowedContextMenuInfo(): any {
    const { actionsPermissionSet } = this.options;
    const { contextMenuItems } = CONTEXT_MENU_INFO;
    const newContextMenuItems = contextMenuItems.filter(c => actionsPermissionSet[c.id]);
    return {contextMenuItems: newContextMenuItems};
  }

  preparePaginationDescription(recordCount: number, pageInfo: any) {
    const currentPageSize: number = this.customPaginator.currentPageSize;
    const currentPageNum: number = this.customPaginator.currentPageNum;
    const totalRecords: number = pageInfo.recordCount;
    this.customPaginator = {
      ...this.customPaginator,
      totalRecords: totalRecords,
      fromRecord: recordCount > 0 ? (currentPageNum - 1) * currentPageSize + 1: 0,
      toRecord: ((currentPageNum - 1) * currentPageSize) + recordCount,
      nextAvailable: pageInfo.nextAvailable
    }
    this.csmRelationshipService.getCustomPaginatorData({
      ...this.customPaginator,
    });
  }

  nextPage(data: number) {
    this.customPaginator = {
      ...this.customPaginator,
      currentPageNum: data
    }
    this.csmRelationshipService.getCustomPaginatorData({
      ...this.customPaginator,
      currentPageNum: data
    });
    this.fetchCardViewData();
  }

  previousPage(data: number) {
    this.customPaginator = {
      ...this.customPaginator,
      currentPageNum: data
    }
    this.csmRelationshipService.getCustomPaginatorData({
      ...this.customPaginator,
      currentPageNum: data
    });
    this.fetchCardViewData();
  }

  pageChange(event: any) {
    console.log(event);
  }

  pageSizeChange(data: any) {
    this.customPaginator = {
      ...this.customPaginator,
      currentPageSize: data,
      currentPageNum: 1
    }
    this.csmRelationshipService.getCustomPaginatorData({
      ...this.customPaginator
    });
    this.fetchCardViewData();
  }
    onPaginationAction(event) {
        this.customPaginator = {
            ...this.customPaginator,
            currentPageNum: event
        }
        this.csmRelationshipService.getCustomPaginatorData({
            ...this.customPaginator,
            currentPageNum: event
        });
        this.fetchCardViewData();
    }


}
