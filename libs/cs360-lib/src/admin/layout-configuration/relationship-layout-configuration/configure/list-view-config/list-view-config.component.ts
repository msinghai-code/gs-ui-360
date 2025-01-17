import {Component, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import { cloneDeep, isEmpty, get } from "lodash";
import { GridType, CompactType } from 'angular-gridster2';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import { FIELD_TREE_DEFAULT_SEARCH_SETTINGS } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import {
 FieldTreeComponent
} from "@gs/gdk/field-tree";
import { GRIDSTER_DEFAULTS } from "@gs/gdk/widget-viewer";
import { compareFields } from "@gs/gdk/utils/field";
import { fieldInfo2path } from "@gs/gdk/utils/field";
import { getUUID } from "@gs/gdk/utils/common";
import {ReportUtils} from "@gs/report/utils";
import { MessageType, HostInfo } from '@gs/gdk/core';
import { findPath, path2FieldInfo, getFieldInfoFromTreeNode} from "@gs/gdk/utils/field";
import { GSField } from "@gs/gdk/core";
import { FieldTreeNode } from '@gs/gdk/core/types';
import { DescribeService } from "@gs/gdk/services/describe";
import { DataTypes } from '@gs/cs360-lib/src/common';
import {
  convertToConfig,
  convertToUIConfig,
  getDecimalPlaces,
  isFieldDraggable,
  getFieldPathInfo,
  getTooltipLabelData
} from "../../relationship-layout-configuration.utils";
import {CONFIG_STEP_LIMITS} from "../../relationship-layout-configuration.constants";
import { 
    FieldConfigurationUtils,
    findFieldInTree,
    getDefaultFormat,
    getDefaultNumericalSummarization,
    getIsEditDisabled, getLookupDisplayField, getSearchableFields } from '@gs/cs360-lib/src/common';
import { CS360Service, ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { NzI18nService} from '@gs/ng-horizon/i18n';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'gs-list-view-config',
  templateUrl: './list-view-config.component.html',
  styleUrls: ['./list-view-config.component.scss']
})
export class ListViewConfigComponent implements OnInit {

  @ViewChild(FieldTreeComponent, { static: false }) fieldTreeViewRef: FieldTreeComponent;
  @Output() onChanges = new EventEmitter();

  public items: any[] = [];
  public tabId: number = 1;
  public options: any;

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
    host: {},
    filterFunction: this.fieldFilterFunction.bind(this),
    baseObject: null,
    selectionMode: "single",
    loading: false,
    show: true
  };

  public fieldSearchSetting = cloneDeep(FIELD_TREE_DEFAULT_SEARCH_SETTINGS);
  public configStepLimits: any;
  private configId: string;
  //{360.admin.list_view_config.drag_drop_left}='Drag and Drop field(s) from left side panel to add them to List View Configuration'
  public extras = {
    description:  this.i18nService.translate('360.admin.list_view_config.drag_drop_left')
  }
  private subs = new SubSink();
  public isSaveIsInProgress: boolean;
  public customizeFieldConfigDrawer = {
    open: false,
    field: null,
    fieldConfigOptions: {
      showDescription: true,
      showSearchConfig: true,
      showLookupDisplayField: true,
      showEditable: false,
      showRollup: false,
      showAggregationType: false
    },
    rootNode: null as any
  }
  
  constructor(private c360Service: CS360Service,
              private _ds: DescribeService,
              private router: Router,
              private route: ActivatedRoute,
              private i18nService: NzI18nService,
              private translocoService: TranslocoService,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO
              ) { }

  ngOnInit() {
    this.bootstrapComponent();
    //this.routeSubscriber();
    this.fetchRelationshipObject();
    this.updateDisableNodeStatus();
  }

  routeSubscriber() {
    this.subs.add(this.route.parent.data.subscribe(routeData => {
      const { data } = routeData;
      const { list = [] } = data.config;
      const { params } = this.route.parent.snapshot;
      this.configId = params.configId || 'new';
      const defaultFieldListForListView  = data.bootstrap ? data.bootstrap.list: [];
      const listItems = !!list && list.length ? list: defaultFieldListForListView;
      this.items = listItems.map(itemConfig => {
        return convertToUIConfig(itemConfig, {treeObj: this.treeOptions.root.children});
      }).filter(i=>!isEmpty(i));
    }));
  }

  bootstrapComponent(): void {
    this.configStepLimits = CONFIG_STEP_LIMITS;
    this.options = {
      ...GRIDSTER_DEFAULTS(true),
      gridType: GridType.VerticalFixed,
      displayGrid: false,
      resizable: {
        enabled: false
      },
      margin: 16,
      outerMargin: true,
      compactType: CompactType.CompactUp,
      fixedRowHeight: 48,
      minCols: 1,
      maxCols: 1,
      minRows: 10,
      maxRows: 20,
      pushItems: false,
      setGridSize: true,
      scrollToNewItems: true,
      useTransformPositioning: true,
      mobileBreakpoint: 200,
      itemChangeCallback: this.itemChangeCallback.bind(this)
    };
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

  fetchRelationshipObject() {
    const { maxNestLevels } = this.treeOptions;
    const host: HostInfo = ReportUtils.getFieldTreeHostInfo(Cs360ContextUtils.getSourceDetailsForRelationship(this.translocoService));
    this._ds.getObjectTree(host, Cs360ContextUtils.getRelationshipBaseObjectName(), maxNestLevels, [], {filterFunction: this.fieldFilterFunction.bind(this),skipFilter:true})  
        .then((tree) => {
          this.treeOptions = {
            ...this.treeOptions,
            root: tree,
            show: true
          }
          this.routeSubscriber();
          // Add additional info like tooltip on-demand info to items.
          let fieldPathLabel;
          this.items = this.items.map((item) => {
            const path = fieldInfo2path({leftOperand: item}, this.treeOptions.root.children);
            return {
              ...item,
              ...getTooltipLabelData(path)
            };
          });
          // Add Relationship Name field.
          if(this.items.length === 0) {
            const nameField = this.getRelationshipNameField();
            this.onAction({type: "ITEM_DROPPED", payload: nameField});
          }
        });
  }

  getRelationshipNameField(): FieldTreeNode {
    let nameField: FieldTreeNode;
    if(this.treeOptions.root && this.treeOptions.root.children) {
      nameField = this.treeOptions.root.children.find((field: FieldTreeNode) => {
        const { data } = field;
        return data.fieldName === "Name";
      });
    }

    return nameField;
  }

  onAction(evt) {
    const { type, payload } = evt;
    switch (type) {
      case 'ITEM_ADDED':
        const error = this.canAddFieldsToListView(payload);
        if(isEmpty(error)) {
          this.addNewItem(payload);
        } else {
          this.openToastMessageBar({message: error.message, action: null, messageType: MessageType.ERROR});
        }
        break;
      case 'CUSTOMIZED':
        this.onFieldCustomization(payload);
        break;
      case 'DELETE':
        this.updateDisableNodeStatus();
        break;
      default: null
    }
    this.onChanges.emit(evt);
  }

  canAddFieldsToListView(field: FieldTreeNode) {
    let error: any = {};
    //{360.admin.list_view_config.field_limit}='Field limit exceeded.'
    //{360.admin.list_view_config.field_already}='Field is already added in List View.'
    if(this.items.length >= CONFIG_STEP_LIMITS.LIST_VIEW_FIELD_LIMIT) {
      error = {
        message:  this.i18nService.translate('360.admin.list_view_config.field_limit')
      }
    } else if(this.duplicateFieldCheck(field)) {
      error = {
        message:  this.i18nService.translate('360.admin.list_view_config.field_already')
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

  addNewItem(field: FieldTreeNode, itemConfig: any = {rows: 1, cols: 1}) {
    const fieldInfo = getFieldInfoFromTreeNode(field);
    const path = fieldInfo2path({leftOperand: fieldInfo}, this.treeOptions.root.children);
    const selectedField: any = path[path.length - 1];
    const uuid = getUUID();
    this.items.push({
      id: `bm_${uuid}`,
      itemId: uuid,
      ...fieldInfo,
      ...itemConfig,
      dragEnabled: isFieldDraggable(fieldInfo),
      // aggregateFunction: fieldInfo.dataType === DataTypes.PERCENTAGE ? "AVG" : "SUM",
      scale: getDecimalPlaces(selectedField.data),
      formatOptions: {
        type: getDefaultFormat(fieldInfo.dataType),
        numericalSummarization: getDefaultNumericalSummarization(fieldInfo.dataType)
      },
      properties: {
        editDisabled: getIsEditDisabled(field.data, this.ctx),
        editable: false, // NOTE: Why is this false all the time?
        required: false,
        navigationConfig: null,
      },
      lookupDisplayField: getLookupDisplayField(field, this.getChildren(field)),
      customizable: !(fieldInfo.dataType === DataTypes.LOOKUP && get(fieldInfo, 'fieldPath.fieldPath')) && FieldConfigurationUtils.isFieldCustomizable(selectedField.data, { showAggregationType: false, skipFieldPathCheck: true, showLookupDisplayField: true }),
      ...getTooltipLabelData(path)
    });
  }

  /**
   * Get complete children details from original company object.
   * Not using field.children as it is having filtered data (not complete) because of search (left sidebar)
   */
  private getChildren(field) {
    if (field.dataType === DataTypes.LOOKUP) {
      const fld = findFieldInTree(field, this.treeOptions.root);
      if (fld) {
        return fld.children;
      }
    }
  }

  fieldFilterFunction(fields: GSField[], allowedDataTypes, allowedFields, uniqueKey): GSField[] {
    return fields.filter(f => !f.meta.formulaField && !([DataTypes.IMAGE].includes(<any>f.dataType)));
  }

  validate(): boolean {
    return true;
  }

  onFieldCustomization(fieldInfo: any) {
    const path = fieldInfo2path({leftOperand: fieldInfo}, this.treeOptions.root.children);
    const node: any = path[path.length - 1];
    this.customizeFieldConfigDrawer = {
      ...this.customizeFieldConfigDrawer,
      open: true,
      field: {
        ...node.data,
        ...fieldInfo,
        nameField: getLookupDisplayField(node, node.children),
        searchableFields: getSearchableFields(node, fieldInfo)
      },
      rootNode: node
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

  onClear() {
    this.items = this.items.filter(i => i.fieldName === 'Name' && !i.fieldPath);
    this.updateDisableNodeStatus();
  }

    // NOTE: made this function to arrow function as the .bind in template triggering input changes
    fnCheckForDisable = this.fnForDisable.bind(this);

    fnForDisable(node) {
        const path = findPath(node);
        const fieldInfo = path2FieldInfo(path);
        // Compare fields now
        return this.items.some(f => compareFields(f, fieldInfo));
    }

  updateDisableNodeStatus() {
    if(this.fieldTreeViewRef) {
      this.fieldTreeViewRef.updateDisableStatusOfNodes();
    }
  }

  serialize() {
    if(this.validate()){
      const config = this.items.map((item) => convertToConfig(item));
      return config;
    } else {
      // Dont do anything for now.
    }
  }

  private openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Service.createNotification(messageType,message, 5000);
    }
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
