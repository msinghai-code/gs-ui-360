
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Pipe, PipeTransform, Inject, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import {forkJoin, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {BaseWidgetComponent, WIDGET_EVENTS} from "@gs/gdk/widget-viewer";
import {DescribeService} from '@gs/gdk/services/describe';
import {GridsterConfig, GridsterItemComponentInterface} from 'angular-gridster2';
import {
    CustomizedField,
    DataTypes,
    FieldConfigurationActionInfo,
    FieldConfigurationActions,
    FieldConfigurationOptions,
    findFieldInTreeByFieldPath,
    ADMIN_CONTEXT_INFO,
    IADMIN_CONTEXT_INFO,
    getDefaultFormat, getLookupDisplayField, getSearchableFields,SummaryWidget, WidgetCategoryType,
    SUMMARY_GRIDSTER_DEFAULTS, WidgetItemSubType
} from '@gs/cs360-lib/src/common';

import { isMultiObjectWidget,SummaryConfigurationService } from '@gs/cs360-lib/src/common';
import { isUndefined, each } from 'lodash';
import {FieldTreeNode} from "@gs/gdk/core/types";

@Component({
  selector: 'gs-attribute-widget-builder',
  templateUrl: './attribute-widget-builder.component.html',
  styleUrls: ['./attribute-widget-builder.component.scss']

})


export class AttributeWidgetBuilderComponent extends BaseWidgetComponent implements OnInit, OnDestroy {

  @ViewChild('gridster', { static: false }) gridster: ElementRef;

  openFieldSettingsDrawer: boolean = false;
  selectedField: CustomizedField;
  widgetItem: SummaryWidget;
  parentItemComponent: GridsterItemComponentInterface;
  onWidgetResize: any;
  fieldConfigOptions: FieldConfigurationOptions = {
    showEditable: true,
    showType: true,
    showLookupDisplayField: true,
    showSearchConfig: true,
    showDecimals: true,
    showNumericSummarization: true,
    showDescription: true
  };
  options: GridsterConfig;
  widgetCategories;
  fieldNameLimit: number = 0;
  isDetachPreview: boolean;
  widgetName: string;
  allFieldWidgets;
  rootNode: FieldTreeNode;
  constructor(private summaryConfigrationService: SummaryConfigurationService,@Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,private ds: DescribeService) {
    super();
    this.fieldNameLimit = this.summaryConfigrationService.getAttributeNameLimit();
  }

  ngOnInit() {
    // We store all field widget data in baseobject as an key
    this.allFieldWidgets[this.ctx.baseObject] = this.allFieldWidgets;
    this.subscribeForResolvedWidgetCategories();
    this.options = {
      ...SUMMARY_GRIDSTER_DEFAULTS.ATTRIBUTE_WIDGET_BUILDER_VIEW((this.parentItemComponent && this.parentItemComponent.$item && this.parentItemComponent.$item.cols) || 2, {}),
      draggable: { enabled: !this.isDetachPreview },
      resizable: { enabled: false },
      itemChangeCallback: (event, grid) => {
        // this method is being called on page load even though no changes are made from UI (maybe some internal changes are done so its emitting this). Also, grid.width is not present on initial load but present later when we rearrange any widget from UI.
        if(grid.width) {
          // this.changes.emit({ widgetItem: this.widgetItem, type: 'TOUCHED' });
            this.changes.emit({
                type: 'TOUCHED',
                payload: {
                    widgetElement: {...this.widgetItem, config: this.flattenConfig(this.widgetItem.config)}
                }
            });
        }
      }
    };
    /**
     * This is because we add childrens on every config field and also for multi object
     * we have to flatten the config which we save on object basis
     *
     */
    if(this.widgetItem.subType === WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE){
      this.setInitialData();
    }else{
      this.widgetConfigSetup(this.widgetItem.config);
    }

    if (this.onWidgetResize) {
      this.onWidgetResize.subscribe(item => {
        let cols = item.$item.cols;
        let rows = item.$item.rows;
        let newConfig = SUMMARY_GRIDSTER_DEFAULTS.ATTRIBUTE_WIDGET_BUILDER_VIEW(cols);
        this.options = {
          ...this.options,
          ...newConfig
        }
        this.options.api.optionsChanged();
        this.resizeElementsInGridster(this.gridster, rows, cols);
      });
    }
  }

  // Describe: Added childrens on every object if its highlight then we add addition objects also need to improve this logic
  setInitialData(){
    const host = { id: "mda", name: "mda", type: "mda" };
    forkJoin([this.ctx.baseObject, ...this.ctx.associatedObjects ].map((object)=>{
      return this.ds.getObjectTree(host, object, 2, this.summaryConfigrationService.getAttributeWidgetSupportedDataTypes(),
          { includeChildren: true, skipFilter: true });
    })).pipe(
      tap((objects)=>{
        objects.forEach((object:any)=> {
          this.allFieldWidgets.children = this.allFieldWidgets.children.concat(object.children);
          this.allFieldWidgets[object.obj.objectName] = {'children' : object.children}
        });
          // base logic for attribute
          this.widgetConfigSetup(this.flattenConfig(this.widgetItem.config));
      }),
    ).subscribe();
  }

  widgetConfigSetup(config){
    each(config, (widgetItem: SummaryWidget) => {
      widgetItem.resizeEnabled = false;
      const axisDetails = widgetItem.axisDetails;
      delete widgetItem.dimensionDetails;
      delete widgetItem.axisDetails;
      widgetItem.rows = 1;
      widgetItem.cols = 1;
      widgetItem.maxItemCols = 1;
      widgetItem.maxItemRows = 1;
      widgetItem.minItemCols = 1;
      widgetItem.minItemRows = 1;
      if(axisDetails) {
        widgetItem.x = axisDetails.x;
        widgetItem.y = axisDetails.y;
      }

      if(!widgetItem.formatOptions) {
        widgetItem.formatOptions = {
          type: getDefaultFormat(widgetItem.dataType),
          numericalSummarization: null
        };
      }

      if(!widgetItem.scale && widgetItem.scale !== 0) {
        widgetItem.scale = widgetItem.meta && widgetItem.meta.decimalPlaces
      }
      this.addHoverLabelToFields(this.allFieldWidgets.children ,widgetItem);
    });
  }

  /**
   * sample flattenData
   * [
    {
        "fieldName": "Email",
        "itemId": "w1__person__Email",
        "label": "Email",
        "dataType": "EMAIL",
        "objectName": "person",
        "objectLabel": "Person",
        "formatOptions": {},
        "scale": 0,
        "fieldPath": null,
        "x": 0,
        "y": 0,
        "resizeEnabled": false,
        "rows": 1,
        "cols": 1,
        "maxItemCols": 1,
        "maxItemRows": 1,
        "minItemCols": 1,
        "minItemRows": 1,
        "hoverLabel": "Email"
    },
    {"fieldName": "Title",},
    { "fieldName": "Role",  }
    }
]
   */
  // Need to improve logic for additional objects
  flattenConfig(config){
    if(isMultiObjectWidget(this.widgetItem.subType)){
      let flattenData = []
      if(config !== undefined && config.length && this.ctx.associatedObjects && this.ctx.associatedObjects.length){
        const allObjectsData =  [this.ctx.baseObject,...this.ctx.associatedObjects]
        allObjectsData.forEach((obj)=>{
          config[0].hasOwnProperty(obj) && flattenData.push(...config[0][obj])
        })
      }
       return flattenData;
    }else{
      return config
    }
  }

  // This function will check for all nested children of section and set original name for the matched widget
  // Used for displaying field path and hover label
  addHoverLabelToFields(allFields, widgetItem, fieldPath?: any) {
    allFields.forEach((field) => {
      if(isUndefined(fieldPath)) {
        fieldPath = widgetItem.fieldPath;
      }
      if(fieldPath && (field.data.fieldName === fieldPath.right.fieldName)) {
        fieldPath.right.label = field.label;
        this.addHoverLabelToFields(field && field.children, widgetItem, fieldPath.fieldPath);
      } else if (widgetItem.fieldName === field.data.fieldName && !fieldPath) {
        widgetItem.hoverLabel =  field.data.label;
        field.hoverLabel =  field.data.label;
        return widgetItem;
      }
    });
  }


  subscribeForResolvedWidgetCategories() {
    this.summaryConfigrationService.getResolvedwidgetCategories().subscribe(x => {
      this.widgetCategories = x;
    });
  }

  resizeElementsInGridster(grid, rows, cols) {
    let maxX = 3;
    for(let i=2; i<=6; i++) {
      if(cols < 4*i && i === 2) {
        maxX = 0;
      } else if(cols >= 4*i && cols < 4*(i+1)) {
        maxX = i-1;
      }
    }
    let curX = 0;
    let curY = 0;
    grid.grid.forEach((value) => {
      if (curX > maxX) {
        curX = 0;
        curY++
      }
      value.$item.x = curX;
      value.$item.y = curY;
      if (value && value.item) {
        value.item.x = curX;
        value.item.y = curY;
      }
      curX++;
    });
    this.options.api.resize();
  }

  onConfigureClick() {
    // this.changes.emit({ widgetItem: this.widgetItem, type: 'CONFIGURE' });
      this.changes.emit({
          type: 'CONFIGURE',
          payload: {
              widgetElement: this.widgetItem
          }
      });
  }

  closeFieldSettingsDrawer() {
    this.selectedField = <CustomizedField>{};
    this.openFieldSettingsDrawer = false;
  }


  /**
   * Sample findFieldInTreeByFieldPath
   * {
    "label": "Name",
    "children": [],
    "parent": null,
    "leaf": true,
    "icon": "datatype:string",
    "dataType": "STRING",
    "lookupOn": "",
    "source": "MDA",
    "dataStore": "HAPOSTGRES",
    "data": {
        "fieldName": "Name",
        "dbName": "gsd73201",
        "label": "Name",
        "dataType": "STRING",
        "objectName": "person",
        "objectDBName": "person_4bf63aa878dd457cbcf0cf250d863a1c",
        "objectLabel": "Person",
        "meta": {
            "properties": {
                "sourceType": "STRING"
            },
            "mappings": {
                "GAINSIGHT": {
                    "key": "GS_PERSON_NAME",
                    "dataType": "string"
                }
            },
        },
        "forcedDataType": null,
        "objectId": "f83ef551-ce58-4e5f-9c1f-051a332feb98"
    },
    "key": "Name"
}
   *
   */
  onFieldSettingsClick(field: CustomizedField) {
    this.mapWidgetGlobalData(field);
    // We get field data with baseObject Children info which help to reaf fieldPath if its have multi lookup data
    const node = findFieldInTreeByFieldPath(field, this.allFieldWidgets);
    this.selectedField = {
        ...field,
        nameField: getLookupDisplayField(node, node && node.children),
        searchableFields: getSearchableFields(node, field)
    };

      // NOTE: Setting meta from allFieldWidgets.
      // In C360, the field meta is set in 'mapWidgetGlobalData' method by using WidgetCategory.FIELD as tree.
      // Since P360 doesn't have WidgetCategory.FIELD, setting it here via allFieldWidgets.
      if(!this.selectedField.hasOwnProperty('meta')) {
          this.selectedField.meta = this.setMetaFromAllFieldWidgets(node);
      }

      this.openFieldSettingsDrawer = true;
      this.rootNode = {...node};
      this.fieldConfigOptions.showRequired = ![DataTypes.BOOLEAN.toString()].includes(this.selectedField.dataType);
  }

    private setMetaFromAllFieldWidgets(node) {
        const { data = {} } = node || {};

        return data.meta || { properties: {} };
    }

  private mapWidgetGlobalData(widgetItem: any): void {
    // convert uppercase to pascal case (ATTRIBUTES => Attributes)
    const displayName = this.widgetItem.label ||  this.widgetItem.subType
    //const subType = displayName.replace(/\w\S*/g,(txt) => {return txt.charAt(0).toUpperCase() +txt.substr(1).toLowerCase()});
    this.widgetName = displayName +': '+ widgetItem.label;
  if (this.widgetCategories[WidgetCategoryType.FIELD] && this.widgetCategories[WidgetCategoryType.FIELD].length) {
    const [value] = this.widgetCategories[WidgetCategoryType.FIELD];
    const widget = findFieldInTreeByFieldPath(widgetItem, value);
    if (widget && widget.data) {
      widgetItem.meta = widget.data.meta;
    } else {
      widgetItem.meta = {properties: {}};
    }
  }
}

  onFieldDelete(field: CustomizedField) {
    if(this.ctx.associatedObjects && this.ctx.associatedObjects.length){
      this.widgetItem.config[0][field.baseObjectName].splice((this.widgetItem.config[0][field.baseObjectName]).indexOf(field), 1);
    }else{
      this.widgetItem.config.splice(this.widgetItem.config.indexOf(field), 1);
    }
    // this.changes.emit({ widgetItem: this.widgetItem, type: 'TOUCHED' });
      this.changes.emit({
          type: 'TOUCHED',
          payload: {
              widgetElement: this.widgetItem
          }
      });
  }

  onFieldConfigured(info: FieldConfigurationActionInfo) {
    if (info.action === FieldConfigurationActions.SAVE) {
      const modifiedFieldIndex = this.flattenConfig(this.widgetItem.config).findIndex(f => f.itemId === this.selectedField.itemId);
      if (modifiedFieldIndex > -1) {
        this.transformFieldConfig(this.flattenConfig(this.widgetItem.config)[modifiedFieldIndex], info.field);
      }
      // this.changes.emit({ widgetItem: this.widgetItem, type: 'TOUCHED' });
        this.changes.emit({
            type: 'TOUCHED',
            payload: {
                widgetElement: this.widgetItem
            }
        });
    }
    this.openFieldSettingsDrawer = false;
  }

  transformFieldConfig(field, item) {
    const { properties, formatOptions, description, scale, fieldPath, x, y, rows, cols, maxItemCols, maxItemRows, minItemCols, minItemRows, label, lookupDisplayField } = item as any;
    field.dimensionDetails = { rows, cols, maxItemCols, maxItemRows, minItemCols, minItemRows };
    field.axisDetails = { x, y };
    field.properties = properties;
    field.formatOptions = formatOptions;
    field.description = description;
    field.lookupDisplayField = lookupDisplayField;
    field.scale = scale;
    field.fieldPath = fieldPath;
    field.label = label;
  }

  ngOnDestroy() {
  }

  trackField(index: number, item: SummaryWidget) {
    return item.itemId;
  }

  onLabelClick(item) {
    if (!item.showLabelInput) {
      item.showLabelInput = true;
      item.tempLabel = item.label;
    }
  }

  saveInput(field) {
    field.label = field.tempLabel.trim() === '' ?  field.label : field.tempLabel.trim();
    this.resetInput(field)
    // this.changes.emit({ widgetItem: this.widgetItem, type: 'TOUCHED' });
      this.changes.emit({
          type: 'TOUCHED',
          payload: {
              widgetElement: this.widgetItem
          }
      });
  }

  resetInput(field) {
    field.showLabelInput = false;
    delete field.tempLabel;
  }
}

@Pipe({
    name: 'fieldPathPipe',
    pure: false
})
export class FieldPathPipe implements PipeTransform {
    transform(field) {
        return this.getFieldLabel(field)
    }
    getFieldLabel(field) {
        let label = '';
        if (field.fieldPath) {
            let fieldPath = field.fieldPath;
            while (fieldPath) {
                label += fieldPath.right.label+' - ';
                fieldPath = fieldPath.fieldPath;
            }
            label += field.hoverLabel;
            return label;
        } else {
            return field.hoverLabel;
        }
    }
}


