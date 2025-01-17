import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { GRIDSTER_DEFAULTS } from "@gs/gdk/widget-viewer";
import { getUUID } from "@gs/gdk/utils/common";
import {ReportUtils} from "@gs/report/utils";
import { StateAction } from '@gs/gdk/core';
import { MessageType, HostInfo } from '@gs/gdk/core';
import { fieldInfo2path, getFieldInfoFromTreeNode, compareFields} from "@gs/gdk/utils/field";
import { GSField } from "@gs/gdk/core";
import { FieldTreeNode } from '@gs/gdk/core/types';
import { DescribeService } from "@gs/gdk/services/describe";
import {cloneDeep, isEmpty, sortBy} from "lodash";
import { Router, ActivatedRoute } from '@angular/router';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import { SubSink } from 'subsink';
import {CompactType, GridType} from 'angular-gridster2';
import { FIELD_TREE_DEFAULT_SEARCH_SETTINGS } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { DataTypes } from '@gs/cs360-lib/src/common';
import { SectionListOptions } from '../../../../admin-sections/modules/shared/section-listing/section-listing.interface';
import { FieldConfigurationUtils, getDefaultFormat, getDefaultNumericalSummarization } from '@gs/cs360-lib/src/common';
import { ItemDropListComponent } from '../../../../item-drop-list/item-drop-list.component';
import { getSampleDataForSummaryRibbonView, getSampleWidgetDataForSummaryRibbonView } from '@gs/cs360-lib/src/common';
import { WidgetCategoryType } from '@gs/cs360-lib/src/common';
import {
  convertToSummaryRibbonConfig,
  convertToUISummaryRibbonConfig, getDecimalPlaces, getFieldPathInfo, getTooltipLabelData
} from "../../relationship-layout-configuration.utils";
// import { CS360Service} from "@gs/cs360-lib";
import { CS360Service } from '@gs/cs360-lib/src/common';
import { NzI18nService} from '@gs/ng-horizon/i18n';
import { TranslocoService } from '@ngneat/transloco';
import { CONFIG_STEP_LIMITS } from '../../relationship-layout-configuration.constants';

@Component({
  selector: 'gs-summary-ribbon-config',
  templateUrl: './summary-ribbon-config.component.html',
  styleUrls: ['./summary-ribbon-config.component.scss']
})
export class SummaryRibbonConfigComponent implements OnInit {

  @ViewChild(ItemDropListComponent, {static: true}) itemDropListComponentRef: ItemDropListComponent;
  @Output() onChanges = new EventEmitter();

  public items: any[] = [];
  public tabId: number = 0;
  public options: any;
  private configId: string;
  public treeOptions = {
    drag: {
      isOutsideDroppable: true,
      isDragIndicatorRequired: true,
      isDataTypeIconRequired: true,
      metaKeySelection: false,
      cdkDropListConnectedTo: []
    },
    nestOnDemand: true,
    resolveMultipleLookups: {},
    enablePartialTree: true,
    pageSize: 200,
    root: null,
    maxNestLevels: 2,
    allowedDataTypes: [],
    host: ReportUtils.getFieldTreeHostInfo(Cs360ContextUtils.getSourceDetailsForRelationship(this.translocoService)),
    filterFunction: this.fieldFilterFunction.bind(this),
    baseObject: "relationship",
    selectionMode: "multiple",
    loading: false,
    show: true
  };
  public previewItems: any[] = [];
  public fieldSearchSetting = cloneDeep(FIELD_TREE_DEFAULT_SEARCH_SETTINGS);
  //{360.admin.summary_ribbon.description}='Drag and Drop data points from left side panel to add them to Summary Ribbon Configuration'
  public extras = {
    description: this.i18nService.translate('360.admin.summary_ribbon.description')
  }
   //{360.admin.summary_ribbon.available_data_points}='Available Data Points'
    //{360.admin.summary_ribbon.drag_drop_canvas}='Drag and drop data points to the canvas'
  sectionListingOptions: SectionListOptions = {
    title:  this.i18nService.translate('360.admin.summary_ribbon.available_data_points') ,
    description:  this.i18nService.translate('360.admin.summary_ribbon.drag_drop_canvas') ,
    serverSideSearch: false
  };
  //{360.admin.summary_ribbon.standard_data_points}="Standard Data Point"
  //{360.admin.summary_ribbon.additional_data_points}="Additional Data Point"
  sectionCategoryList = [
    {
      "id": "STANDARD",
      "label": this.i18nService.translate('360.admin.summary_ribbon.standard_data_points') ,
      "active": true,
      "children": [],
      "widgetCategory": WidgetCategoryType.STANDARD,
      "treeOptions": {
        "isOutsideDroppable": true,
        "isDragIndicatorRequired": true,
        "isDataTypeIconRequired": false,
        "validateDrop": true,
        "filter": false,
        "filterBy": "label"
      },
      "isLoading": false,
      "scope": "LOCAL"
    },
    {
      "label": this.i18nService.translate('360.admin.summary_ribbon.additional_data_points') ,
      "id": "ADDITIONAL",
      "active": true,
      "children": [],
      "treeOptions": {
        "isOutsideDroppable": true,
        "isDragIndicatorRequired": true,
        "isDataTypeIconRequired": false,
        "validateDrop": true,
        "filter": false,
        "filterBy": "label"
      },
      "widgetCategory": WidgetCategoryType.FIELD,
      "isLoading": false,
      "scope": "GLOBAL"
    }
  ]
  isSaveIsInProgress: boolean;
  private subs = new SubSink();
  public customizeFieldConfigDrawer = {
    open: false,
    field: null,
    fieldConfigOptions: {
      showDescription: false,
      showSearchConfig: false,
      showLookupDisplayField: false,
      showEditable: false,
      showRollup: false,
      showAggregationType: true
    },
    rootNode: null
  }
  MAX_LIMIT = CONFIG_STEP_LIMITS.SUMMARY_RIBBON_FIELD_LIMIT;

  constructor(private _ds: DescribeService,
              private cdr: ChangeDetectorRef,
              private route: ActivatedRoute,
              private router: Router,
              private c360Service: CS360Service,
              private i18nService: NzI18nService,
              private translocoService: TranslocoService) { }

  ngOnInit() {
    this.bootstrapComponent();
    // this.routeSubscriber();
    this.fetchRelationshipObject();
  }

  routeSubscriber() {
    this.subs.add(this.route.parent.data.subscribe(routeData => {
      const { data } = routeData;
      const { ribbon = [] }  = data.config;
      const { params } = this.route.parent.snapshot;
      this.configId = params.configId || 'new';
      this.items = !!ribbon ? ribbon.map(itemConfig => {
        return convertToUISummaryRibbonConfig(itemConfig, {treeObj: this.sectionCategoryList[1].children})
      }).filter(i=>!isEmpty(i)): [];
      const standardDataPoints  = data.bootstrap ? data.bootstrap.ribbon: [];
      this.setStandardDatapoint(standardDataPoints);
      this.updatePreview();
    }));
  }

  bootstrapComponent(): void {
    this.options = {
      ...GRIDSTER_DEFAULTS(true),
      gridType: GridType.VerticalFixed,
      resizable: {
        enabled: false
      },
      margin: 10,
      outerMargin: true,
      compactType: CompactType.CompactUp,
      fixedRowHeight: 48,
      minCols: 1,
      maxCols: 1,
      minRows: 6,
      maxRows: 6,
      pushItems: false,
      setGridSize: true,
      scrollToNewItems: false,
      useTransformPositioning: true,
      mobileBreakpoint: 200,
      itemInitCallback: this.itemInitCallback.bind(this),
      itemChangeCallback: this.itemChangeCallback.bind(this),
      itemRemovedCallback: this.itemRemovedCallback.bind(this)
    };
  }

  setStandardDatapoint(dataPoints: any[]) {
    this.sectionCategoryList[0].children = this.processData(dataPoints);
  }

  fetchRelationshipObject() {
    const { maxNestLevels } = this.treeOptions;
    this.sectionCategoryList[1].isLoading = true;
    const host: HostInfo = ReportUtils.getFieldTreeHostInfo(Cs360ContextUtils.getSourceDetailsForRelationship(this.translocoService));
    this._ds.getObjectTree(host, 'relationship', maxNestLevels, [], {filterFunction: this.fieldFilterFunction.bind(this)})
        .then((tree) => {
          this.sectionCategoryList[1].isLoading = false;
          this.sectionCategoryList[1].children = this.processTreeData(tree.children);
          this.routeSubscriber();
          let fieldPathLabel;
          // Add additional info like tooltip on-demand info to items.
          this.items = this.items.map((item) => {
            const path = fieldInfo2path({leftOperand: item}, tree.children);
            return {
              ...item,
              ...getTooltipLabelData(path)
            };
          });
        });
  }

  processTreeData(fields: any) {
    fields.forEach((field: any) => {
      if(field.children.length) {
        field.data = {...field.data, dragDisabled: true};
        this.processTreeData(field.children);
      }
    });
    return fields;
  }

  onAction(evt: StateAction) {
    const { type, payload } = evt;
    let error: any;
    switch (type) {
      case 'ITEM_ADDED':
        switch (payload.widgetCategory.toUpperCase()) {
          case 'STANDARD':
            error = this.canAddStandardWidgetsToListView(payload);
            if(isEmpty(error)) {
              this.addNewStandardItem(payload);
            } else {
              this.openToastMessageBar({message: error.message, action: null, messageType: MessageType.ERROR});
            }
            break;
          case 'FIELD':
            error = this.canAddFieldsToListView(payload);
            if(isEmpty(error)) {
              this.addNewItem(payload);
            } else {
              this.openToastMessageBar({message: error.message, action: null, messageType: MessageType.ERROR});
            }
            break;
          default: null;
        }
        this.updatePreview();
        break;
      case 'CUSTOMIZED':
        this.onFieldCustomization(payload);
        break;
      case 'TEXT_EDITED':
        this.updatePreview();
        break;
      case 'DELETE':
        this.items = [...this.items];
        this.updatePreview();
        this.cdr.detectChanges();
        break;
      case 'ITEM_REARRANGED':{
        this.updatePreview();
        break;
      }
      default: null
    }
    this.onChanges.emit(evt);
  }

  canAddFieldsToListView(field: FieldTreeNode) {
    let error: any = {};
    if(this.items.length >= this.MAX_LIMIT) {
      error = {
        message: this.i18nService.translate('360.admin.summary_ribbon.field_limit')
      }
    } else if(this.duplicateFieldCheck(field)) {
       //{360.admin.summary_ribbon.field_already}='Field is already added in Summary Ribbon.'
      error = {
        message: this.i18nService.translate('360.admin.summary_ribbon.field_already')
      }
    }

    return error;
  }

  canAddStandardWidgetsToListView(field: FieldTreeNode) {
    let error: any = {};
    if(this.items.length >= 6) {
       //{360.admin.summary_ribbon.field_limit}='Item(s) limit exceeded.'
        //{360.admin.summary_ribbon.widget_already}='Widget is already added in Summary Ribbon.'
      error = {
        message: this.i18nService.translate('360.admin.summary_ribbon.field_limit') ,
      }
    } else if(this.duplicateStandardWidgetCheck(field)) {
      error = {
        message: this.i18nService.translate('360.admin.summary_ribbon.widget_already') ,
      }
    }

    return error;
  }

  duplicateFieldCheck(field: FieldTreeNode): boolean {
    const fieldInfo = getFieldInfoFromTreeNode(field);
    return this.items.some(item => {
      return compareFields(item, fieldInfo);
    });
  }

  duplicateStandardWidgetCheck(widget: any): boolean {
    return this.items.some(item => item.attributeId === widget.data.attributeId);
  }

  addNewItem(field: any, itemConfig: any = {rows: 1, cols: 1}) {
    const fieldInfo = getFieldInfoFromTreeNode(field);
    const path = fieldInfo2path({leftOperand: fieldInfo}, this.sectionCategoryList[1].children);
    const selectedField: any = path[path.length - 1];
    const uuid = getUUID();
    const newItem = {
      id: `field_${uuid}`,
      itemId: uuid,
      config: fieldInfo,
      ...fieldInfo,
      ...itemConfig,
      widgetCategory: field.widgetCategory,
      aggregateFunction: fieldInfo.dataType === DataTypes.PERCENTAGE ? "AVG" : "SUM",
      scale: getDecimalPlaces(selectedField.data),
      //label:pathFieldlabel(selectedField.data),
      formatOptions: {
        type: getDefaultFormat(fieldInfo.dataType),
        numericalSummarization: getDefaultNumericalSummarization(fieldInfo.dataType)
      },
      customizable: FieldConfigurationUtils.isFieldCustomizable(selectedField.data, { showAggregationType: true, skipFieldPathCheck: true }),
      ...getTooltipLabelData(path)
    };
    this.items = [...this.items, newItem as any];
    this.cdr.detectChanges();
  }

  addNewStandardItem(widget: any): void {
    console.log(widget);
    const { data, label, widgetCategory, dimensionDetails } = widget;
    const uuid = getUUID();
    const newItem = {
      id: `widget_${uuid}`,
      itemId: uuid,
      ...data,
      ...dimensionDetails,
      label,
      widgetCategory,
      customizable: false,
      subType: data.attributeId
    };
    this.items = [...this.items, newItem as any];
    this.cdr.detectChanges();
  }

  itemInitCallback() {
    setTimeout(()=>this.updatePreview());
  }

  itemChangeCallback(event, grid) {
    // grid.width will only exists when changes gridster item is rearranged by user.
    if(grid.width) {
      this.onAction({
        type: 'ITEM_REARRANGED',
        payload: null
      });
    }
  }

  itemRemovedCallback() {
    setTimeout(()=>this.updatePreview());
  }

  updatePreview() {
    let items = this.itemDropListComponentRef && this.itemDropListComponentRef.value || [];
    if(!items.length) {
      items = this.items;
    }
    if(items) {
      this.previewItems = items.map((item) => {
        const { dataType, label, widgetCategory, attributeId } = item;
        return {
          name: label,
          data: widgetCategory === WidgetCategoryType.STANDARD ? getSampleWidgetDataForSummaryRibbonView(label, attributeId): getSampleDataForSummaryRibbonView(dataType)
        };
      });
    } else {
      this.previewItems.length = 0;
    }
  }

  validate(): boolean {
    return true;
  }

  onFieldCustomization(fieldInfo: any) {
    const path = fieldInfo2path({leftOperand: fieldInfo}, this.sectionCategoryList[1].children);
    const selectedField: any = path[path.length - 1];
    this.customizeFieldConfigDrawer = {
      ...this.customizeFieldConfigDrawer,
      open: true,
      field: {...selectedField.data, ...fieldInfo},
      rootNode: path[path.length - 1]
    }
  }

  closeFieldSettingsDrawer() {
    this.customizeFieldConfigDrawer.open = false;
  }

  onFieldConfigured(evt) {
    const { action, field } = evt;
    switch (action) {
      case 'SAVE':
        // Compare fields and update the items array with new changes.
        const fieldIndex: number = this.items.findIndex(i => compareFields(i, field));
        if(fieldIndex !== -1) {
          this.items[fieldIndex] = {...this.items[fieldIndex], ...field};
          this.items = this.items.slice();
        }
        this.customizeFieldConfigDrawer = {
          ...this.customizeFieldConfigDrawer,
          open: false,
          field: null
        };

        this.onAction({
          type: 'FIELD_CONFIGURED',
          payload: null
        });
        
        setTimeout(()=>this.updatePreview());
        break;
      case 'CANCEL':
        this.customizeFieldConfigDrawer = {
          ...this.customizeFieldConfigDrawer,
          open: false,
          field: null
        };
        break;
    }
  }

  serialize() {
    if(this.validate()) {
      const config = this.items.map((item) => convertToSummaryRibbonConfig(item));
      return config;
    } else {
      // Dont do anything for now.
    }
  }

  fieldFilterFunction(fields: GSField[], allowedDataTypes, allowedFields, uniqueKey): GSField[] {
    return fields.filter(f => !f.meta.formulaField && ([DataTypes.NUMBER, DataTypes.CURRENCY, DataTypes.PERCENTAGE, DataTypes.LOOKUP, DataTypes.RICHTEXTAREA].includes(<any>f.dataType)));
  }

  private openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Service.createNotification(messageType, message, 5000);
    }
  }

  private processData(data) {
    return data.map(d => {
      return {
        children: [],
        data: d,
        key: d.attributeId,
        label: d.displayName,
        leaf: true
      }
    });
  }

  onItemDrop($event: CdkDragDrop<any>) {
    const { item } = $event;
    this.onAction({
      type: 'ITEM_ADDED',
      payload: item.data
    });
  }

  getPathLabel(item: any, actualLabel: string) {
   const pathLabel = getFieldPathInfo(item);
    return pathLabel ? pathLabel + ' ➝ ' + actualLabel : actualLabel;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
