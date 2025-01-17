import AdminSectionInterface from '../AdminSectionInterface';
import { AttributeGroup, AttributesSaveConfig } from './attribute-configuration.constants';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import {
  cloneDeep,
  findIndex,
  isEmpty,
  max,
  size,
  sortBy,
  merge
} from 'lodash';
import { CompactType, DisplayGrid, GridType, GridsterConfig } from 'angular-gridster2';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Pipe,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  CustomizedField,
  FieldConfigurationActionInfo,
  FieldConfigurationActions,
  FieldConfigurationOptions,
  findFieldInTree,
  getDefaultFormat,
  getLookupDisplayField,
  getIsEditDisabled,
  getDefaultNumericalSummarization,
  findFieldInTreeByFieldPath
} from '@gs/cs360-lib/src/common';
import { DataTypes } from '@gs/cs360-lib/src/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { GRIDSTER_DEFAULTS, GRIDSTER_ITEM_DEFAULTS } from '@gs/gdk/widget-viewer';
import { ISection } from '@gs/cs360-lib/src/common';
import {ReportUtils} from "@gs/report/utils";
import { MessageType } from '@gs/gdk/core';
import { GSField } from "@gs/gdk/core";
import { DescribeService } from "@gs/gdk/services/describe";
import { SubSink } from 'subsink';
import { DefaultFieldSearchSetting, FieldTreeViewOptions } from '@gs/cs360-lib/src/common';
import { MDA_HOST } from '@gs/cs360-lib/src/common';
import { fieldInfo2path, findPath, path2FieldInfo } from "@gs/gdk/utils/field";
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
// import { PageContext } from '@gs/cs360-lib/src/common';
import { FieldTreeViewWrapperComponent } from '@gs/cs360-lib/src/common';
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { EnvironmentService } from "@gs/gdk/services/environment"
import { CS360Service } from '@gs/cs360-lib/src/common';
import { TranslocoService } from '@ngneat/transloco';
import {AbstractConfigComponent, getSearchableFields} from "@gs/cs360-lib/src/common";
import {FieldTreeNode} from "@gs/gdk/core/types";


interface AttributeField extends CustomizedField {
  showLabelInput?: boolean;
  tempLabel?: string;
}

const BOUNDARIES_PER_DATATYPE = {
  [DataTypes.RICHTEXTAREA] : {
    minItemCols: 2,
    minItemRows: 2,
    maxItemCols: 4,
    maxItemRows: 2,
  },
  [DataTypes.STRING] : {
    minItemCols: 1,
    minItemRows: 1,
    maxItemCols: 4,
    maxItemRows: 1,
  },
}

const DIMENSIONS_PER_DATATYPE = {
  [DataTypes.RICHTEXTAREA] : {
    rows: 2,
    cols: 4,
  },
  [DataTypes.STRING] : {
    rows: 1,
    cols: 1,
  }
}

const DEFAULT_BOUNDARIES = {
  minItemCols: 1,
  minItemRows: 1,
  maxItemCols: 1,
  maxItemRows: 1,
}

const DEFAULT_BOUNDARIES_FOR_RESIZABLE_TYPES = {
  minItemCols: 1,
  minItemRows: 1,
  maxItemCols: 4,
  maxItemRows: 1,
};

const DEFAULT_DIMENSIONS = {
  rows: 1,
  cols: 1,
}

const RESIZE_ENABLED_DATATYPES = [
  DataTypes.RICHTEXTAREA,
  DataTypes.STRING,
  DataTypes.URL,
  DataTypes.MULTISELECTDROPDOWNLIST
];

@Component({
  selector: 'gs-attribute-configuration',
  templateUrl: './attribute-configuration.component.html',
  styleUrls: ['./attribute-configuration.component.scss']
})
export class AttributeConfigurationComponent extends AbstractConfigComponent implements OnInit, AdminSectionInterface {

  @ViewChild('groupLayout', { static: false }) groupLayout: ElementRef;
  @ViewChildren('gridster') gridsters: QueryList<ElementRef>;
  @ViewChild(FieldTreeViewWrapperComponent, { static: false }) fieldTreeViewWrapper: FieldTreeViewWrapperComponent;

  groups: AttributeGroup[] = [];
  setEditableGroups: AttributeGroup[] = [];
  options: GridsterConfig;
  openFieldSettingsDrawer = false;
  selectedFieldInfoForConfig: {
    group: AttributeGroup;
    field: AttributeField;
    fieldConfigOptions: FieldConfigurationOptions;
    rootNode: FieldTreeNode
  };
  section: ISection;
  treeOptions: FieldTreeViewOptions;
  showEditablePopup = false;
  searchInput = new FormControl();
  searchTerm: string;
  loading = false;
  changesMade = false;
  objInfo;
  groupsLimit: number;
  groupOptions: GridsterConfig;

  private subs = new SubSink();

  public rearrangeGroupModal = {
    isVisible: false,
    handleCancel: this.handleCancel.bind(this),
    handleOk: this.handleOk.bind(this),
    isOkLoading: false,
    open: this.openRearrangeGroupModel.bind(this)
  }

  showGridster = true;
  sortedGroup;
  allEditable: boolean;
  allCheckedText: string;
  disableSelectAll: boolean = false;
  labelClass;
  //{360.admin.attribute_config.no_field_config}='No fields configured'-->
  //{360.admin.attribute_config.drag_drop_left}= 'Drag-and-drop attributes from the left side panel to add them to the layout'
 noFieldsconfig =  this.i18nService.translate('360.admin.attribute_config.no_field_config')
 dragDropattributes =this.i18nService.translate('360.admin.attribute_config.drag_drop_left')

  @ViewChild("listitemsort", { static: false }) listItemSortRef: any;

  constructor( @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
    private _ds: DescribeService, private cdr: ChangeDetectorRef, @Inject("envService") private env: EnvironmentService, private i18nService: NzI18nService, private c360Sevice: CS360Service, private translocoService: TranslocoService) {
      super();
    }



  ngOnInit() {
    this.setTreeOptions();
    this.populateSavedConfig();
    this.subscribeForSearchInput();
    this.setGridsterOptions();
    const moduleConfig = this.env.moduleConfig;
    this.groupsLimit = moduleConfig.attributeGroupsLimit;
      if (this.fieldTreeViewWrapper) {
          this.fieldTreeViewWrapper.updateDisableStatusOfNodes();
      }
  }

  updateAllChecked() {
    let filteredResults = [];
    if (this.searchTerm) {
      this.setEditableGroups.forEach(group => {
        group.columns.forEach(col => {
          if (col.fieldName.toLowerCase().includes(this.searchTerm.toLowerCase())) {
            filteredResults.push(col);
          }
        })
      })
    } else {
      this.setEditableGroups.forEach(group => {
        group.columns.forEach(col => {
          filteredResults.push(col);
        })
      })
    }
    //{360.admin.attribute_config.unselectall}=Unselect All
    if (this.allEditable) {
      this.allCheckedText = this.i18nService.translate('360.admin.attribute_config.unselectall')
      filteredResults.forEach((col) => {
        col.properties.editable = !getIsEditDisabled(col, this.ctx);;
      })
    } else {
      //{360.admin.attribute_config.selectall}=Select All
      this.allCheckedText = this.i18nService.translate('360.admin.attribute_config.selectall')
      filteredResults.forEach((col) => {
        col.properties.editable = false;
      })
    }
  }

  checkIfAllSelected() {
    let checkedFlag = true;
    let checkDisabled = true;
    this.setEditableGroups.forEach((group) => {
      group.columns.forEach(col => {
        const editDisabled = getIsEditDisabled(col, this.ctx);
        if (!editDisabled) {
          checkDisabled = false;
        }
        if (!col.properties.editable && !editDisabled) {
          return checkedFlag = false;
        }
      })
    })
    if (checkDisabled) {
      this.allCheckedText = this.i18nService.translate('360.admin.attribute_config.selectall');
      this.disableSelectAll = true;
      return;
    }
    this.disableSelectAll = false;
    this.allEditable = checkedFlag;
    this.allCheckedText = this.allEditable ? this.i18nService.translate('360.admin.attribute_config.unselectall') : this.i18nService.translate('360.admin.attribute_config.selectall');
    this.labelClass = this.groups.length <= 1 ? 'editable-popup-content__field' : '';
  }

  private setTreeOptions() {
    this.treeOptions = {
      // host: ReportUtils.getFieldTreeHostInfo(Cs360ContextUtils.getSourceDetails(this.translocoService, this.ctx)),
      host: ReportUtils.getFieldTreeHostInfo({
        "objectName": this.ctx.baseObject,
        "objectLabel": this.i18nService.translate(this.ctx.translatedBaseObjectLabel),
        "connectionType": "MDA",
        "connectionId": "MDA",
        "dataStoreType": "HAPOSTGRES"
    }),
      fieldSearchSetting: { ...DefaultFieldSearchSetting, maintainDefaultOrder: false },
      skipFilter: true,
      nestOnDemand: true,
      showTooltip: true,
      resolveMultipleLookups: {},
      dragOptions: {
        isOutsideDroppable: true,
        isDragIndicatorRequired: true,
        isDataTypeIconRequired: true,
        cdkDropListConnectedTo: [],
      },
      enablePartialTree: true,
      pageSize: 200,
      filterFunction: this.fieldFilterFunction.bind(this),
      root: null,
      // baseObject: Cs360ContextUtils.getBaseObjectName(this.ctx),
      baseObject: this.ctx.baseObject,
      maxNestLevels: 2
    }
    // if (this.ctx.pageContext === PageContext.C360) {
    //   this._ds.getObjectTree(this.treeOptions.host, 'company', 2).then(res => {
    //     this.objInfo = res;
    //   });
    // } else {
    //   this._ds.getObjectTree(this.treeOptions.host, 'relationship', 2).then(res => {
    //     this.objInfo = res;
    //   });
    // }
    this._ds.getObjectTree(this.treeOptions.host, this.ctx.baseObject, 2, undefined, {skipFilter: true}).then(res => {
      this.objInfo = res;
    });
  }

  private fieldFilterFunction(fields: GSField[], allowedDataTypes, allowedFields): GSField[] {
    return fields.filter(item => {
      return item.dataType !== DataTypes.IMAGE;
    });
  }

  saveInput(field: AttributeField | AttributeGroup) {
      if(field.tempLabel) {
          if( field.tempLabel === '' || field.tempLabel.trim().length <= 0){
              field.label = field.hasOwnProperty('properties') && field['properties'].originalLabel ? field['properties'].originalLabel: field.label;
          } else {
              field.label = field.tempLabel;
          }
      } else {
          field.label = field.label;
      }
    this.changesMade = true;
    this.resetInput(field)
  }

  resetInput(field: AttributeField | AttributeGroup) {
    field.showLabelInput = false;
    delete field.tempLabel;
  }

  isConfigurationChanged() {
    return this.changesMade;
  }

  private setGridsterOptions() {
    this.options = {
      ...GRIDSTER_DEFAULTS(true),
      gridType: GridType.VerticalFixed,
      displayGrid: DisplayGrid.OnDragAndResize,
      enableOccupiedCellDrop: true,
      maxCols: 4,
      resizable: {
        enabled: false
      },
      margin: 20,
      compactType: CompactType.CompactLeftAndUp,
      fixedRowHeight: 50,
      minCols: 4,
      minRows: 3,
      outerMarginBottom: 2,
      outerMarginLeft: 2,
      outerMarginTop: 2,
      outerMarginRight: 20,
      disableScrollHorizontal: true,
      setGridSize: true,
      scrollToNewItems: false,
      itemChangeCallback: this.onItemChange.bind(this),
      pushDirections: {
        north: false,
        south: true,
        east: false,
        west: false,
      },
      gridSizeChangedCallback: this.gridSizeChangedCallback.bind(this)
    };

    if (this.section.isDetachSectionPreview) {
      this.options.resizable = { enabled: false };
      this.options.draggable = { enabled: false };
    }

    this.groupOptions = {
      ...GRIDSTER_DEFAULTS(true),
      displayGrid: DisplayGrid.None,
      pushDirections: {
        north: true,
        south: true,
        east: false,
        west: false,
      },
      gridType: GridType.VerticalFixed,
      maxCols: 1,
      resizable: {
        enabled: false
      },
      draggable: {
        dropOverItems: !this.section.isDetachSectionPreview,
        enabled: !this.section.isDetachSectionPreview
      },
      margin: 20,
      outerMarginTop: 0,
      outerMarginLeft: 1,
      outerMarginRight: 1,
      outerMarginBottom: 50,
      compactType: CompactType.CompactUp,
      fixedRowHeight: 450,
      minCols: 1,
      minRows: 1,
      maxItemRows: 2,
      setGridSize: true,
      useTransformPositioning: true,
      disableScrollHorizontal: true,
      scrollToNewItems: false,
      itemChangeCallback: this.onItemChange.bind(this),
      gridSizeChangedCallback: this.gridSizeChangedCallback.bind(this)
    }
  }

  private async populateSavedConfig() {
    let resp = await this._ds.getObjectTree(MDA_HOST, this.ctx.baseObject, 2, null, {
      skipFilter: true
    });

    if (!isEmpty(this.section.config)) {
      this.groups = (this.section.config.groups && this.convertToConfig(this.section.config.groups, resp)) || [];
    }
    //{360.admin.attribute_config.untitled_group}=Untitled Group
    //{360.admin.attribute_config.group}=group-
    if (!this.groups.length) {
      this.groups = [{
        groupId: "group-" + 1,
        label: this.i18nService.translate('360.admin.attribute_config.untitled_group'),
        showLabelInput: false,
        columns: []
      }]
    }

    this.groups.forEach((group, i) => {
      group.groupId = i + Math.random().toString();
      merge(group, {
        cols: 1,
        rows: 1,
        x: 0,
        y: i
      })
    });

    this.updateDropListConnectedToArray();
  }

  /**
   * Returns valid dimensions: if rows/cols are less than min, it returns min, if rows/cols are more than max, it returns max
   */
  getValidDimensions(defaultOptions, fieldDimensions) {
    let rows = fieldDimensions.rows, cols = fieldDimensions.cols;

    if(rows < defaultOptions.minItemRows) {
      rows = defaultOptions.minItemRows;
    } else if (rows > defaultOptions.maxItemRows) {
      rows = defaultOptions.maxItemRows;
    }

    if(cols < defaultOptions.minItemCols) {
      cols = defaultOptions.minItemCols;
    } else if (cols > defaultOptions.maxItemCols) {
      cols = defaultOptions.maxItemCols;
    }

    return { rows, cols };
  }

  convertToConfig(groups, resp) {
    return groups.map(g => {
      g.columns = g.columns.map(c => {
        let meta = null;

        const node = findFieldInTreeByFieldPath(c, resp);

        const defaultOptions = this.getDefaultOptions(c.dataType);

        const { rows, cols } = this.getValidDimensions(defaultOptions, c.dimensionDetails);

        const dimensionDetails = {
          ...defaultOptions,
          rows,
          cols
        }
        let hoverLabel = c.label;
        if (node) {
          hoverLabel = node.label;
          meta = node.data.meta;
        } else {
          meta = {
            properties: {}
          }
        }
        const fieldInfo = {
          meta: meta,
          fieldName: c.fieldName,
          itemId: c.itemId,
          label: c.label,
          hoverLabel,
          lookupDisplayField: c.lookupDisplayField,
          nameField: getLookupDisplayField(node, node.children),
          searchableFields: getSearchableFields(node, c),
          dataType: c.dataType,
          objectName: c.objectName,
          ...dimensionDetails,
          ...c.axisDetails,
          description: c.description,
          scale: c.scale,
          properties: c.properties,
          fieldPath: c.fieldPath,
          formatOptions: c.formatOptions
        }
        fieldInfo.properties.originalLabel = this.getFieldLabel(fieldInfo);
        return fieldInfo;
      });
      return g;
    });

  }

  private getDefaultOptions(dataType): GridsterConfig {
    const dimensions = DIMENSIONS_PER_DATATYPE[dataType] || DEFAULT_DIMENSIONS;
    const resizeEnabled = RESIZE_ENABLED_DATATYPES.includes(dataType);
    const boundaries = BOUNDARIES_PER_DATATYPE[dataType] || (resizeEnabled ? DEFAULT_BOUNDARIES_FOR_RESIZABLE_TYPES : DEFAULT_BOUNDARIES);

    return {
      ...GRIDSTER_ITEM_DEFAULTS(dimensions.rows, dimensions.cols),
      ...boundaries,
      resizeEnabled
    };
  }

  private subscribeForSearchInput() {
    this.subs.add(this.searchInput.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((text: any) => {
      this.searchTerm = text;
    }));
  }

  private onItemChange(item, grid) {
    // this method is being called on page load even though no changes are made from UI (maybe some internal changes are done so its emitting this). Also, grid.width is not present on initial load but present later when we rearrange any widget from UI.
    if (grid.width) {
      this.changesMade = true;
    }
    this.getNewGridHeight(grid.gridster);
  }

  private gridSizeChangedCallback(gridItem) {
    this.getNewGridHeight(gridItem);
  }

  private getNewGridHeight(gridComponent) {
    if (size(this.groups) > 1) {
      let maxY = max(gridComponent.grid.map(item => item.$item.y)) + 2;
      gridComponent.el.style.maxHeight = (maxY * 75) + "px";
      gridComponent.el.style.height = (maxY * 75) + "px";
    }
  }

  addGroup() {

    if (this.checkLimitsExceeded(true, null)) {
      return;
    }  
    const group = {
      groupId: "group-" + Date.now(),
      showLabelInput: false,
      label: this.i18nService.translate('360.admin.attribute_config.untitled_group'),
      columns: []
    };

    this.groups.push(group);

    this.updateDropListConnectedToArray();
    this.changesMade = true;
    // const cdkDropLists = this.groups.map(x => x.groupId);
    // this.treeOptions = {
    //   ...this.treeOptions,
    //   dragOptions: {...this.treeOptions.dragOptions, cdkDropListConnectedTo: cdkDropLists}
    // };
    this.handleGroupLabel(group, true);
  }

  private focusGroupLabelInput(select) {
    if (this.groups.length > 1) {
      const inputElement: HTMLInputElement = this.groupLayout.nativeElement.querySelector(".attribute-group__header__input");

      inputElement.scrollIntoView({ behavior: 'smooth' })
      if (select) {
        inputElement.select();
      }
    }
  }

  onEditableModalOkClick() {
    this.changesMade = true;
    if (this.groups.length) {
      this.groups = this.setEditableGroups;
    }
    this.showEditablePopup = false;
  }

  onFieldSettingsClick(field: AttributeField, group: AttributeGroup) {
    const path = fieldInfo2path({leftOperand: field}, this.objInfo.children);
    this.selectedFieldInfoForConfig = {
      group,
      field,
      fieldConfigOptions: {
        showEditable: true,
        showDescription: true,
        showType: true,
        showDecimals: true,
        showLookupDisplayField: true,
        showSearchConfig: true,
        showNumericSummarization: true,
        showRequired: ![DataTypes.BOOLEAN.toString()].includes(field.dataType),
      },
      rootNode: path[path.length - 1]
    };
    this.openFieldSettingsDrawer = true;
  }

  closeFieldSettingsDrawer() {
    this.selectedFieldInfoForConfig = <any>{};
    this.openFieldSettingsDrawer = false;
  }

  onFieldConfigured(info: FieldConfigurationActionInfo) {
    if (info.action === FieldConfigurationActions.SAVE) {
      this.changesMade = true;
      const modifiedFieldIndex = this.selectedFieldInfoForConfig.group.columns.findIndex(f => f === this.selectedFieldInfoForConfig.field);
      if (modifiedFieldIndex >= 0) {
        const column = this.selectedFieldInfoForConfig.group.columns[modifiedFieldIndex];
        const node = findFieldInTreeByFieldPath(column, this.objInfo);
        const searchableFields = getSearchableFields(node, info.field);
        info.field.searchableFields = searchableFields;
        this.selectedFieldInfoForConfig.group.columns[modifiedFieldIndex] = info.field;
      }
    }
    this.openFieldSettingsDrawer = false;
  }

  onFieldDelete(field: AttributeField, group: AttributeGroup) {
    this.changesMade = true;
    if (field.fieldPath) {
      let _path = this.getPath(field, "");
      const path = (_path ? (_path + ".") : "") + field.fieldName;
      const existingFieldsPath = group.columns.find(f => {
        let _p = this.getPath(f, "");
        return path === ((_p ? (_p + ".") : "") + f.fieldName);
      });
      group.columns = group.columns.filter(f => f !== existingFieldsPath);
    } else {
      group.columns = group.columns.filter(f => f !== field);
    }

    if (this.fieldTreeViewWrapper) {
      this.fieldTreeViewWrapper.updateDisableStatusOfNodes();
    }
  }


    onNodeDragEnd(event){
        console.log('event', event)
        const node =
            event &&
            event.payload &&
            event.payload.source &&
            event.payload.source.data;
        if (node) {
            node.disableDrag = true;
        }
    }

  handleGroupLabel(group: AttributeGroup, select = false) {
    if (!group.showLabelInput) {
      group.showLabelInput = true;
      group.tempLabel = group.label;

      setTimeout(() => {
        this.focusGroupLabelInput(select);
      }, 50);
    }
  }

  onShowEditablePopup() {
    this.setEditableGroups = cloneDeep(this.groups);
    this.showEditablePopup = true;
    this.checkIfAllSelected();
  }

  onGroupDelete(group: AttributeGroup) {
    const index = findIndex(this.groups, grp => grp.groupId === group.groupId);
    this.groups.splice(index, 1);
    this.updateDropListConnectedToArray();

    if (this.fieldTreeViewWrapper) {
      this.fieldTreeViewWrapper.updateDisableStatusOfNodes();
    }
  }

  onGroupLabelBlur(group) {
    group.showLabelInput = false;
  }

  checkIfFieldExists(field) {
    let _path = this.getPath(field, "");
    const path = (_path ? (_path + ".") : "") + field.fieldName;

    let allFields = (this.groups.map(gr => {
      return gr.columns;
    }) as any).flat();

    return allFields.find(f => {
      let _p = this.getPath(f, "");
      return path === ((_p ? (_p + ".") : "") + f.fieldName);
    });
  }

  // NOTE: made this function to arrow function as the .bind in template triggering input changes
  fnCheckForDisable = this.fnForDisable.bind(this);

  fnForDisable(node) {
    const fieldInfo = path2FieldInfo(findPath(node));
    return this.checkIfFieldExists(fieldInfo);
  }

  onFieldDrop(evt, group: AttributeGroup, gridster) {
    this.changesMade = true;

    // ALERT: do not change in describe tree node data, not even by reference
    let field = {...evt.item.data.data};
    const nameField = getLookupDisplayField(evt.item.data, this.getChildren(evt.item.data));
    field.fieldPath = path2FieldInfo(findPath(evt.item.data)).fieldPath;

    const existingFieldsPath = this.checkIfFieldExists(field);

    if (existingFieldsPath) {
      this.openToastMessageBar({ message:this.i18nService.translate('360.admin.AttributeMessages.FIELD_EXISTS'), action: null, messageType: MessageType.ERROR });
      return;
    }

    const { dataType, meta } = field;
    field.hoverLabel = field.label;

    field = {
      ...field,
      properties: {
        editable: false,
        required: meta && meta.required,
        navigationConfig: null,
        originalLabel: this.getFieldLabel(field)
      },
      formatOptions: {
        type: getDefaultFormat(dataType),
        numericalSummarization: getDefaultNumericalSummarization(dataType)
      },
      scale: meta && meta.decimalPlaces,
      lookupDisplayField: nameField,
      nameField: nameField
    }

    //this.getNewGridHeight(gridster.gridRenderer.gridster);
    field = {
      ...field,
      ...this.getDefaultOptions(field.dataType)
    }

    group.columns.push(field);
  }

  private checkLimitsExceeded(checkGroupLimit: boolean, group: any) {
    const moduleConfig = this.env.moduleConfig;
    if(!checkGroupLimit) {
      if(this.groups.length > 1 && group.columns && group.columns.length >= moduleConfig.attributeGroupFieldsLimit) {
          this.openToastMessageBar({ message: this.i18nService.translate('360.admin.AttributeMessages.GROUP_FIELD_LIMIT_REACHED').replace('{MAX_LIMIT_VALUE}', moduleConfig.attributeGroupFieldsLimit), messageType: MessageType.ERROR });
        return true;
      } else if (group.columns && group.columns.length >= moduleConfig.attributeFieldsLimit) {
        this.openToastMessageBar({ message: this.i18nService.translate('360.admin.AttributeMessages.FIELD_LIMIT_REACHED'), messageType: MessageType.ERROR });
        return true;
      }
    } else if (this.groups.length >= moduleConfig.attributeGroupsLimit) {
      this.openToastMessageBar({ message: this.i18nService.translate('360.admin.AttributeMessages.GROUP_LIMIT_REACHED'), messageType: MessageType.ERROR });
      return true;
    }
    return false;
  }

  /**
   * Get complete children details from original company object.
   * Not using field.children as it is having filtered data (not complete) because of search (left sidebar)
   */
  private getChildren(node) {
    const fieldInfo = path2FieldInfo(findPath(node));
    const path = fieldInfo2path({leftOperand: fieldInfo}, this.objInfo.children);
    return path[path.length - 1].children;
  }

  private getFieldLabel(field) {
    if (!field.fieldPath) {
      return field.hoverLabel;
    }

    let fieldPath = field.fieldPath;
    let labelPathArray = [];
    while (fieldPath) {
      labelPathArray.push(fieldPath.right.fieldLabel || fieldPath.right.label);
      fieldPath = fieldPath.fieldPath;
    }
    labelPathArray.push(field.hoverLabel);

    return labelPathArray.join(" → ");
  }

  onFieldDropOnGroup(event, group) {
    let index = this.gridsters.toArray().length === 1 ? 0 : event.currentIndex;

    if (this.checkLimitsExceeded(false, group)) {
      return;
    }
    this.onFieldDrop(event, group, this.gridsters.toArray()[index]);
  }

  onGroupDrop(event) {
    moveItemInArray(this.groups, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.changesMade = true;
    }
  }

  handleLabelInput(field: AttributeField) {
    if (!field.showLabelInput) {
      field.showLabelInput = true;
      field.tempLabel = field.label;
    }
  }

  updateDropListConnectedToArray() {
    this.treeOptions = {
      ...this.treeOptions,
      dragOptions: {
        ...this.treeOptions.dragOptions,
        cdkDropListConnectedTo: this.groups.map(group => group.groupId)
      }
    }
  }

  openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Sevice.createNotification(messageType, message, 5000);
    }
  }

  toJSON(): AttributesSaveConfig {
    let count = 0;
    let groups = cloneDeep(this.groups);

    if (groups.length === 1) {
      groups[0].label = this.i18nService.translate('360.admin.attribute_config.untitled_group');
    }

    groups.forEach(item => {
      item.columns.forEach(col => {
        count++
        col.itemId = "bm_" + count;
      });
    });

    groups = sortBy(groups, ['y']).map(g => ({
      columns: g.columns.map(col => this.convertToJSON(col)),
      label: g.label
    }));

    return {
      groups
    };
  }

  convertToJSON(column) {
    const { fieldName, itemId, label, dataType, objectName, properties, formatOptions, description, aggregateFunction, scale, fieldPath, x, y, rows, cols, lookupDisplayField } = column;
    return {
      fieldName,
      itemId,
      label,
      dataType,
      objectName,
      lookupDisplayField,
      properties,
      formatOptions,
      description,
      aggregateFunction,
      scale,
      fieldPath,
      dimensionDetails: {
        rows,
        cols
      },
      axisDetails: {
        x,
        y
      }
    }

  }



  validate() {
    const invalidGroup = this.groups.length > 1 && this.groups.find(group => !group.label);

    if (invalidGroup) {
      invalidGroup.showLabelInput = true;

      setTimeout(() => {
        this.focusGroupLabelInput(false);
      }, 50);
      //{360.admin.attribute_config.group_empty_message}=Group label cannot be empty
      this.openToastMessageBar({
        message: this.i18nService.translate('360.admin.attribute_config.group_empty_message'),
        messageType: MessageType.ERROR
      });

      return false;
    }

    return true;
  }

  getPath(field, path) {

    if (!field.fieldPath) {

      if (field.lookupName) {
        path = path + "." + (field.lookupName || "");
        if (path === ".") { path = "" }
      }
      return path;
    }
    if (path) {
      path = path + "." + (field.lookupName || "");
    } else {
      path = (field.lookupName || "");
    }
    return this.getPath(field.fieldPath, path);
  }

  showLoader(flag: boolean): void {
    this.loading = flag;
  }

  openRearrangeGroupModel() {
    this.sortedGroup = sortBy(this.groups, ['y']).map(group => {
      group.name = group.label;
      return group;
    });
    this.rearrangeGroupModal = {
      ...this.rearrangeGroupModal,
      isVisible: true
    }
  }

  handleCancel() {
    this.rearrangeGroupModal = {
      ...this.rearrangeGroupModal,
      isVisible: false
    }
  }

  handleOk() {
    this.handleCancel();
    // update the y coordinate of the gridster and refresh the gridster.
    this.changesMade = true;
    this.showGridster = false;
    this.groups = this.listItemSortRef.sortedItems.map((g, index) => {
      g['y'] = index;
      delete g.name;
      return g;
    });
    this.cdr.detectChanges();
    this.showGridster = true;
  }

}


@Pipe({
  name: 'areFieldsPresentInGroup',
  pure: false
})
export class AreFieldsPresentInGroup {
  transform(groups: AttributeGroup[]) {
    return groups.some(group => group.columns.length > 0)
  }
}


@Pipe({
  name: 'isFieldEditDisabled',
  pure: true
})
export class isFieldEditDisabledPipe {

  constructor(
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO
  ) {}
  transform(field) {
    return getIsEditDisabled(field, this.ctx);
  }
}
