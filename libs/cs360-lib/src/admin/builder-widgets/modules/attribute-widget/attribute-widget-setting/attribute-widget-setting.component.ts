import {Component, Inject, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef} from '@angular/core';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import {ReportUtils} from "@gs/report/utils";
import { BaseWidgetComponent } from "@gs/gdk/widget-viewer";
import {buildFieldPath, compareFields, findPath, path2FieldInfo} from "@gs/gdk/utils/field";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  DefaultFieldSearchSetting,
  SummaryWidget,
  APPLICATION_MESSAGES,
  ADMIN_CONTEXT_INFO,
  IADMIN_CONTEXT_INFO,
  findFieldInTree,
  findFieldInTreeByFieldPath,
  getDefaultFormat,
  getDefaultNumericalSummarization,
  getLookupDisplayField 
} from '@gs/cs360-lib/src/common';
import { isEmpty, filter, isEqual } from 'lodash';
import { SummaryConfigurationService } from '@gs/cs360-lib/src/common';
// import { DataTypes } from '@gs/portfolio-lib';
// import { DataTypes } from '@gs/portfolio-lib';
import { DataTypes, WidgetItemSubType, isMultiObjectWidget } from '@gs/cs360-lib/src/common';
import {NzNotificationService} from "@gs/ng-horizon/notification";
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { TranslocoService } from '@ngneat/transloco';
import {FieldChooserComponent} from "@gs/gdk/field-chooser";
import { DescribeService } from '@gs/gdk/services/describe';
import { forkJoin, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'gs-attribute-widget-setting',
  templateUrl: './attribute-widget-setting.component.html',
  styleUrls: ['./attribute-widget-setting.component.scss']
})
export class AttributeWidgetSettingComponent extends BaseWidgetComponent implements OnInit {
  widgetForm: FormGroup;
  //TO DO :  this part need to handle dynamically for relationship
  widgetItem: SummaryWidget;
  treeOptions;
  existingFields: string[] = [];
  allFieldWidgets;
  coreObjectInfo = {}
  public objectList = [];
  selectedFieldsCount = 0;
  maxAllowedFieldsCount = 0;
  isMaxLimitExceed = false;

  // For single object
  @ViewChild(FieldChooserComponent, {static: false}) fieldChooser: FieldChooserComponent;

  // for multi object
  @ViewChildren(FieldChooserComponent) attributeFieldChooser:QueryList<FieldChooserComponent> ;

  constructor(private fb: FormBuilder, private ds: DescribeService,
    private summaryConfigrationService: SummaryConfigurationService, @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO, private notification: NzNotificationService,private i18nService: NzI18nService, private translocoService: TranslocoService) {
    super();

    const host = ReportUtils.getFieldTreeHostInfo({
      "objectName": this.ctx.baseObject,
      "objectLabel": this.i18nService.translate(this.ctx.translatedBaseObjectLabel),
      "connectionType": "MDA",
      "connectionId": "MDA",
      "dataStoreType": "HAPOSTGRES"
  }) as any;
    this.treeOptions = {
      host,
      fieldSearchSetting: {...DefaultFieldSearchSetting, maintainDefaultOrder: false},
      selectionMode: "checkbox",
      resolveMultipleLookups: false,
      allowUnSelectEvent: false,
      root: null,
      maxNestLevels: 1,
      selection: [],
      filterBy: "label",
      showLookupInfo: true,
      maximumSelectedNodes: 0,
      allowedDataTypes: [],
      baseObject: this.ctx.baseObject,
      skipFilter: false,
      filterFunction: (fields, allowedDataTypes, allowedFields, uniqKey) => {
        return filter(fields, (field) => allowedDataTypes.indexOf(field.dataType.toUpperCase()) > -1);
      },
      isDataTypeIconRequired: true,
    };
    this.maxAllowedFieldsCount = this.summaryConfigrationService.getMaxAttributesAllowedInAttributeWidget();
    this.treeOptions.maximumSelectedNodes = this.summaryConfigrationService.getMaxAttributesAllowedInAttributeWidget();
    this.treeOptions.allowedDataTypes = this.summaryConfigrationService.getAttributeWidgetSupportedDataTypes();
    this.treeOptions.maxNestLevels = this.summaryConfigrationService.getLookupLevel();
  }

  ngOnInit() {
    this.createFieldWidgetSectionForm();
    if(isMultiObjectWidget(this.widgetItem.subType)){
       // For multi Object we convert allfieldWidgets is an array of object where every object have there childrens info.
      this.allFieldWidgets[this.ctx.baseObject] = this.allFieldWidgets;
      const host = { id: "mda", name: "mda", type: "mda" };
      // We need meta data for all objects so we call this in this associated objects contain object other than base object [cp, rp]
      const allObjects = this.ctx.associatedObjects && this.ctx.associatedObjects.length ?  [this.ctx.baseObject, ...this.ctx.associatedObjects]  : [this.ctx.baseObject]
      // Make a objectWise describecall to get children of every object to render fields info in attributes
      forkJoin([...allObjects ].map((object)=>{
        return this.ds.getObjectTree(host, object, 2, this.summaryConfigrationService.getAttributeWidgetSupportedDataTypes(),
          { includeChildren: true, skipFilter: true });
      })).pipe(
        tap((objects)=>{
          objects.forEach((object:any)=>  {
            this.allFieldWidgets.children = this.allFieldWidgets.children.concat(object.children);
            this.allFieldWidgets[object.obj.objectName] = {'children' : object.children}
          })
          // base logic for attribute
          this.baseObjectCall(allObjects);
        }),
      ).subscribe();
    }else{
      this.treeOptions.selection = this.getCompleteFieldsData(this.ctx.baseObject,this.widgetItem.subType);
    }

  }


  baseObjectCall(allObjects){
   this.objectList = [...allObjects]
   this.objectList.forEach((objectName)=>{
      this.coreObjectInfo[objectName] = {
        treeOptions: {...this.treeOptions,host: { id: "mda", name: "mda", type: "mda" },baseObject:objectName,
                  filterFunction: this.filterFieldFunction.bind(this),
                  selection: this.getCompleteFieldsData(objectName, this.widgetItem.subType)}
      }
    });
  }

  createFieldWidgetSectionForm(){
    this.widgetForm = this.fb.group({
      label: [this.widgetItem.label, [Validators.required, extraSpaceValidator, Validators.maxLength(90)]],
      id: [this.widgetItem.itemId]
    });
    // [] [{p:{},cp:{},rp:{}}]
    if (isEmpty(this.widgetItem.config)) {
      this.widgetItem.config = [];
    }
  }

   /*** Sample of getCompleteFieldsData this collects all information regards each field
   [{
        "label": "Email",
        "children": [],
        "parent": null,
        "leaf": true,
        "icon": "datatype:email",
        "dataType": "EMAIL",
        "lookupOn": "",
        "source": "MDA",
        "dataStore": "HAPOSTGRES",
        "data": {
            "fieldName": "Email",
            "dbName": "gsd50698",
            "label": "Email",
            "dataType": "EMAIL",
            "objectName": "person",
            "objectDBName": "person_4bf63aa878dd457cbcf0cf250d863a1c",
            "objectLabel": "Person",
            "meta": {All Properties},
            "forcedDataType": null,
            "objectId": "f83ef551-ce58-4e5f-9c1f-051a332feb98"
        },
        "key": "Email"
    }
   */

  private getCompleteFieldsData(objectname, subType) {
    // return dataimportant sample if its multiAttribute then rconfig save in multiobject form rest all same
    if(subType ===  WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE){
      if(this.widgetItem.config.length > 0 &&  this.widgetItem.config[0].hasOwnProperty(objectname)){
        this.selectedFieldsCount += (this.widgetItem.config[0][objectname] || []).length;
        this.isMaxLimitExceed = this.selectedFieldsCount === this.maxAllowedFieldsCount;
        return  this.widgetItem.config[0][objectname].map(field => {
           const treeField = findFieldInTreeByFieldPath(field, this.allFieldWidgets[objectname]);
           return field.fieldPath ? {...treeField, fieldPath: field.fieldPath} : treeField;
         })}
      return [];
    }else{
      return this.widgetItem.config.map(field => {
        const treeField = findFieldInTreeByFieldPath(field, this.allFieldWidgets[objectname]);
        return field.fieldPath ? {...treeField, fieldPath: field.fieldPath} : treeField;
      });
    }
  }


  private getChildren(field, baseObject) {
    if(field.dataType === DataTypes.LOOKUP) {
      const fld = findFieldInTree(field, this.allFieldWidgets[baseObject]);
      if(fld) {
        return fld.children;
      }
    }
  }

  /**
   * Sample: MultiObject
   * {"label": "Attributes",
    "id": "w1",
    "config": [{ "person": [{"fieldName": "Email",More}],
          "company_person": [{"fieldName": "Role",More}],
          "relationship_person": [{"fieldName": "Title", More}]
        }]}
   *
   */
  toJSON(){
    // Need to ask if any chance getmultiObjectFieldChooser is empty and selectedNodes is empty what error we show and where and how
    let fields = [];
    if(this.widgetForm.valid){
      // retrive fields config for multi object
      if(isMultiObjectWidget(this.widgetItem.subType)){
        let getmultiObjectFieldChooser =  this.attributeFieldChooser.toArray();
        if(this.widgetForm.valid && (getmultiObjectFieldChooser.length > 0)){
          fields = [{}];
          getmultiObjectFieldChooser.forEach((fieldChooser)=>{
             let selectedNodes = (fieldChooser.value || []).map(v => v.rawNode);
             if(selectedNodes.length > 0){
                     fields[0][fieldChooser.baseObject] = selectedNodes.map((field)=>{
                        return this.getSelectedFields(this.widgetItem.config.length && this.widgetItem.config[0][fieldChooser.baseObject] && this.widgetItem.config[0][fieldChooser.baseObject].length  ? this.widgetItem.config[0][fieldChooser.baseObject] : [], field, fieldChooser.baseObject);
                    })
             }
           })
            return { ...this.widgetForm.value, config: fields };
        }
      }else{
        // retrive fields config for single object
        const selectedNodes = (this.fieldChooser.value || []).map(v => v.rawNode);
        fields = selectedNodes.length ? selectedNodes.map((field)=>{
           return this.getSelectedFields(this.widgetItem.config, field, this.ctx.baseObject);
          }) : [];
        return { ...this.widgetForm.value, config: fields };
      }
    }else {
      this.widgetForm.markAsTouched();
      if (this.widgetForm.value.label.length > 90 || this.widgetForm.value.label.length === 0) {
        return { isValid: false, message: this.i18nService.translate('360.admin.APPLICATION_MESSAGES.WIDGET_NAME_FOR_ATTRIBUTE')};
      }
      else {
        return { isValid: false, message: this.i18nService.translate('360.admin.APPLICATION_MESSAGES.SELECT_FIELDS_FOR_ATTRIBUTE') };
      } 
    }

  }

  getSelectedFields(savedFields, selectedField, baseObject){
    const existingField = savedFields.find(exFld => {
      if(selectedField.parent) {
        const path = findPath(selectedField);
        if (selectedField.data) {
          const fieldInfo = path2FieldInfo(path, {},true);
          const fieldPath = fieldInfo ? fieldInfo.fieldPath : undefined;
          return isEqual(fieldPath, exFld.fieldPath) && (selectedField.fieldName || selectedField.data.fieldName) === exFld.fieldName;
        }
      } else if(selectedField.fieldPath) {
        return isEqual(selectedField.fieldPath, exFld.fieldPath) && (selectedField.fieldName || selectedField.data.fieldName) === exFld.fieldName;
      } else if(!exFld.fieldPath) {
        return (selectedField.fieldName || selectedField.data.fieldName) === exFld.fieldName;
      }
    });

    if(existingField) {
      return existingField;
    }

    this.summaryConfigrationService.setFieldPath(selectedField);
    let lookupDisplayField;
    if(selectedField.dataType === DataTypes.LOOKUP && !selectedField.lookupDisplayField && this.allFieldWidgets[baseObject]) {
      lookupDisplayField = getLookupDisplayField(selectedField, this.getChildren(selectedField, baseObject));
    }

    const tempData = { ...selectedField.data, ...selectedField  };
    // here objectname is lookupObjectName like for person createdBy its GsUser
    const { fieldName, label, dataType, meta, objectName,objectLabel, x, y, maxItemCols, maxItemRows, minItemCols, minItemRows, cols, rows, scale } = tempData;
    const fieldPath = selectedField.fieldPath || selectedField.data.fieldPath;
    return {
      fieldName, label, dataType, objectName,objectLabel, fieldPath, meta,
      baseObjectName: baseObject,
      editable: false,
      required: false,
      hoverLabel: label,
      scale: tempData.meta && tempData.meta.decimalPlaces,
      formatOptions: {
        type: getDefaultFormat(dataType),
        numericalSummarization: getDefaultNumericalSummarization(dataType)
      },
      itemId: this.getItemId(baseObject,fieldName,fieldPath),
      axisDetails: { x, y },
      dimensionDetails: { cols, rows, maxItemCols, maxItemRows, minItemCols, minItemRows },
      lookupDisplayField
    };
  }

  onNodeSelect($event) {
    const { errorCode } = $event;
    if (errorCode === 'max_selection_limit_exceed') {
      // this.toastMessageService.add(APPLICATION_MESSAGES.ATTRIBUTE_WIDGET_MAX_LIMIT_MESSAGE(this.treeOptions.maximumSelectedNodes), MessageType.WARN, null, { duration: 5000 });
       this.notification.create('warning','', this.i18nService.translate(APPLICATION_MESSAGES.ATTRIBUTE_WIDGET_MAX_LIMIT_MESSAGE,{
           maxCount : this.treeOptions.maximumSelectedNodes.toString()}), [],{nzDuration:5000})
    }else{
      this.selectedFieldsCount += $event.isSelected && this.selectedFieldsCount < this.maxAllowedFieldsCount ? 1 : (!$event.isSelected ? -1 : 0);
      this.isMaxLimitExceed = this.selectedFieldsCount === this.maxAllowedFieldsCount;
    }
  }

  private getItemId(objectName,fieldName, fieldPath) {
    if(this.widgetItem.subType === WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE){
     let fieldpathLookupNames = ''
      if(fieldPath !== undefined){
        fieldpathLookupNames  = this.extractFieldNames(fieldPath).join('.');
      }
     return `${this.widgetItem.itemId}__${objectName}__${fieldpathLookupNames !== '' && fieldpathLookupNames !== undefined ? fieldpathLookupNames+'.'+fieldName : fieldName}`;
    }else{
      return `${this.widgetItem.itemId}a${Math.random().toString(16).slice(2)}`;
    }


  }

  extractFieldNames(fieldPath){
      // Base case: if the object doesn't have fieldPath or right, return an empty array
      if (!fieldPath || !fieldPath.right) {
        return [];
      }
      // Recursive case: extract fieldName and call the function on the next level
      const fieldName = fieldPath.right.fieldName;
      const nextObj = fieldPath.fieldPath;

      return [fieldName, ...this.extractFieldNames(nextObj)];
  }

  filterFieldFunction(fields, allowedDataTypes) {
    return filter(fields, (field) =>
        ((this.ctx.associatedObjectsDisabledFields ? !this.ctx.associatedObjectsDisabledFields.includes(field.fieldName) : true)
          && allowedDataTypes.indexOf(field.dataType.toUpperCase()) > -1)
    );
  }

}
