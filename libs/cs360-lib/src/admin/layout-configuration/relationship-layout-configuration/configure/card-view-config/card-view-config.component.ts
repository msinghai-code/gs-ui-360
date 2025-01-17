import {ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {
 FieldTreeComponent
} from "@gs/gdk/field-tree";
import { GRIDSTER_DEFAULTS } from "@gs/gdk/widget-viewer";
import { compareFields } from "@gs/gdk/utils/field";
import { fieldInfo2path } from "@gs/gdk/utils/field";
import { getUUID } from "@gs/gdk/utils/common";
import {ReportUtils} from "@gs/report/utils";
import { MessageType, HostInfo } from '@gs/gdk/core';
import { StateAction } from '@gs/gdk/core';
import { findPath, path2FieldInfo, getFieldInfoFromTreeNode } from "@gs/gdk/utils/field";
import { GSField } from "@gs/gdk/core";
import { FieldTreeNode } from '@gs/gdk/core/types';
import { DescribeService } from "@gs/gdk/services/describe";
import {cloneDeep, isEmpty, get} from "lodash";
import {CompactType, GridType} from 'angular-gridster2';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { APPLICATION_ROUTES, FIELD_TREE_DEFAULT_SEARCH_SETTINGS } from '@gs/cs360-lib/src/common';
import { DataTypes } from '@gs/cs360-lib/src/common';
import {CONFIG_STEP_LIMITS} from "../../relationship-layout-configuration.constants";
import { ItemDropListComponent } from '../../../../item-drop-list/item-drop-list.component';
import { getSampleDataForCardView, getSampleHeathScoreData } from '@gs/cs360-lib/src/common';
import {
  convertToConfig,
  convertToUIConfig,
  getDecimalPlaces,
  getFieldPathInfo,
  getTooltipLabelData,
  isFieldDraggable,
  isHealthScoreField
} from "../../relationship-layout-configuration.utils";
import {FieldConfigurationUtils, findFieldInTree, getDefaultFormat, getDefaultNumericalSummarization, getIsEditDisabled, getLookupDisplayField, getSearchableFields} from '@gs/cs360-lib/src/common';
import { CS360Service } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { NzI18nService} from '@gs/ng-horizon/i18n';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'gs-card-view-config',
  templateUrl: './card-view-config.component.html',
  styleUrls: ['./card-view-config.component.scss']
})
export class CardViewConfigComponent implements OnInit {

  @ViewChild(ItemDropListComponent, {static: true}) itemDropListComponentRef: ItemDropListComponent;
  @ViewChild(FieldTreeComponent, { static: false }) fieldTreeViewRef: FieldTreeComponent;
  @Output() onChanges = new EventEmitter();

  public items: any[] = [];
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
    selectionMode: "multiple",
    loading: false,
    show: true
  };
  public fieldSearchSetting = cloneDeep(FIELD_TREE_DEFAULT_SEARCH_SETTINGS);
  public configStepLimits: any;
  public previewItems: any[] = [];
  //{360.admin.card_view_config.drag_drop_left}='Drag and Drop field(s) from left side panel to add them to Card View Configuration'
  public extras = {
    description: this.i18nService.translate('360.admin.card_view_config.drag_drop_left')
  }
  public data: any = {};
  private subs = new SubSink();
  public nameField: any = null;
  public isSaveIsInProgress: boolean;
  private configId: string;
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

  /**
   * Get the Card View Configuration
   */
  get value() {
    if(this.itemDropListComponentRef) {
      return this.itemDropListComponentRef.value;
    }
    return [];
  }

  constructor(private cdr: ChangeDetectorRef,
              private _ds: DescribeService,
              private router: Router,
              private c360Service: CS360Service,
              private route: ActivatedRoute,
              private i18nService: NzI18nService,
              private translocoService: TranslocoService,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO
              ) { }

  ngOnInit() {
    //this.routeSubscriber();
    this.bootstrapComponent();
    this.fetchRelationshipObject();
  }

  routeSubscriber() {
    this.subs.add(this.route.parent.data.subscribe(routeData => {
      const { data } = routeData;
      const { card = [] } = data.config;
      const { params } = this.route.parent.snapshot;
      this.configId = params.configId || 'new';
      const defaultFieldListForCardView  = data.bootstrap ? data.bootstrap.card: [];
      const cardItems = !!card && card.length ? card: defaultFieldListForCardView;
      // Case: Omit the fields which are not present in the describe call.
      this.items = cardItems.map(itemConfig => {
        return convertToUIConfig(itemConfig, {treeObj: this.treeOptions.root.children});
      }).filter(i=>!isEmpty(i));
    }));
  }

  bootstrapComponent(): void {
    this.configStepLimits = CONFIG_STEP_LIMITS;
    this.options = {
      ...GRIDSTER_DEFAULTS(true),
      displayGrid: false,
      gridType: GridType.VerticalFixed,
      resizable: {
        enabled: false
      },
      margin: 10,
      outerMargin: true,
      compactType: CompactType.None,
      fixedRowHeight: 48,
      minCols: 2,
      maxCols: 2,
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

  fetchRelationshipObject() {
    const { maxNestLevels } = this.treeOptions;
    const host: HostInfo = ReportUtils.getFieldTreeHostInfo(Cs360ContextUtils.getSourceDetailsForRelationship(this.translocoService));
    this._ds.getObjectTree(host, 'relationship', maxNestLevels, [], {filterFunction: this.fieldFilterFunction.bind(this)})
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
            this.onAction({type: "ITEM_DROPPED", payload: nameField}, {rows: 1, cols: 2});
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

  onAction(evt: StateAction, itemConfig: any = {rows: 1, cols: 1}) {
    const { type, payload } = evt;
    switch (type) {
      case 'ITEM_ADDED':
        const error = this.canAddFieldsToCardView(payload);
        if(isEmpty(error)) {
          this.addNewItem(payload, itemConfig);
        } else {
          this.openToastMessageBar({message: error.message, action: null, messageType: MessageType.ERROR});
        }
        break;
      case 'TEXT_EDITED':
        this.updatePreview();
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

  /**
   * Validate addition of fields to card views.
   * Case 1: At max 6 fields can be added.
   * Case 2: Certain datatypes are not allowed.
   * Case 3: Duplicate fields are not allowed.
   */
  canAddFieldsToCardView(field: FieldTreeNode) {
    let error: any = {};
    //{360.admin.card_view_config.field_limit_exceed}='Field limit exceeded.'
    //{360.admin.card_view_config.field_already}='Field is already added in Card View.'
    if(this.items.length >= CONFIG_STEP_LIMITS.CARD_VIEW_FIELD_LIMIT) {
      error = {
        message: this.i18nService.translate('360.admin.card_view_config.field_limit_exceed')
      }
    } else if(this.duplicateFieldCheck(field)) {
      error = {
        message: this.i18nService.translate('360.admin.card_view_config.field_already')
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

  nameFieldCheck(field: FieldTreeNode) {
    const fieldInfo = getFieldInfoFromTreeNode(field);
    return fieldInfo.fieldName === 'Name' && fieldInfo.objectName === 'relationship';
  }

  addNewItem(field: FieldTreeNode, itemConfig: any = {rows: 1, cols: 1}) {
    const fieldInfo = getFieldInfoFromTreeNode(field);
    const path = fieldInfo2path({leftOperand: fieldInfo}, this.treeOptions.root.children);
    const selectedField: any = path[path.length - 1];
    const uuid = getUUID();
    const newItem = {
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
        editable: false,
        required: false,
        navigationConfig: null,
      },
      lookupDisplayField: getLookupDisplayField(field, this.getChildren(field)),
      customizable: !(fieldInfo.dataType === DataTypes.LOOKUP && get(fieldInfo, 'fieldPath.fieldPath')) && FieldConfigurationUtils.isFieldCustomizable(selectedField.data, { showAggregationType: false, skipFieldPathCheck: true, showLookupDisplayField: true }),
      ...getTooltipLabelData(path)
    }
    const nextPosition: object = this.itemDropListComponentRef.gridster.getFirstPossiblePosition(newItem);
    this.items.push({...newItem, ...nextPosition});
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
    setTimeout(()=>this.updatePreview());
  }

  itemRemovedCallback() {
    setTimeout(()=>this.updatePreview());
  }

  updatePreview() {
    if(this.itemDropListComponentRef && this.itemDropListComponentRef.value) {
      this.previewItems = this.itemDropListComponentRef.value.map((item) => {
        const { dataType, fieldName, objectName } = item;
        return {
          ...item,
          dragEnabled: false,
          value: getSampleDataForCardView(dataType, this.i18nService),
          complexValue: isHealthScoreField(fieldName, objectName) ? getSampleHeathScoreData(): null
        }
      });
    } else {
      this.previewItems.length = 0;
    }
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
    setTimeout(()=>this.updatePreview());
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

  fieldFilterFunction(fields: GSField[], allowedDataTypes, allowedFields, uniqueKey): GSField[] {
    return fields.filter(f => !f.meta.formulaField && !([DataTypes.IMAGE, DataTypes.RICHTEXTAREA, DataTypes.JSON].includes(<any>f.dataType)));
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

  public openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Service.createNotification(messageType, message, 5000);
    }
  }
}
