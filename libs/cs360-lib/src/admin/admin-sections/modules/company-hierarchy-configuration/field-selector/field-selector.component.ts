import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, ViewChild, SimpleChanges } from '@angular/core';
import { CustomizedField, FieldConfigurationActionInfo, FieldConfigurationActions, FieldConfigurationOptions, FieldConfigurationUtils, findFieldInTree, findFieldInTreeByFieldPath, getIsEditDisabled, getLookupDisplayField } from '@gs/cs360-lib/src/common';
import { findIndex, cloneDeep, map, find, isEqual, forEach } from 'lodash';
import { FieldUtils, ReportUtils } from '@gs/report/utils';
import { MessageType } from '@gs/gdk/core';
import { path2FieldInfo } from '@gs/gdk/utils/field';
import { findPath } from "@gs/gdk/utils/field";
import { GSField } from "@gs/gdk/core";
import { DescribeService } from "@gs/gdk/services/describe";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Cs360ContextUtils,
  ChartViewFields,
  CompanyHierarchyColumn,
  CompanyHierarchyViewLabels,
  NameField,
  ViewInfo,
  DataTypes,
  FieldTreeViewWrapperComponent,
  MDA_HOST,
  IADMIN_CONTEXT_INFO,
  ADMIN_CONTEXT_INFO,
  CS360Service,
  DefaultFieldSearchSetting,
  FieldTreeViewActions,
  FieldTreeViewOptions } from "@gs/cs360-lib/src/common";
import { getDefaultFormat, getDefaultNumericalSummarization } from "@gs/cs360-lib/src/common";
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { TranslocoService } from '@ngneat/transloco';
import {compareFields, fieldInfo2path} from "@gs/gdk/utils/field";

@Component({
  selector: 'gs-field-selector',
  templateUrl: './field-selector.component.html',
  styleUrls: ['./field-selector.component.scss']
})
export class FieldSelectorComponent implements OnInit, OnChanges {

  @ViewChild(FieldTreeViewWrapperComponent, { static: false }) fieldTreeViewWrapper: FieldTreeViewWrapperComponent;
  @Input() viewInfo: ViewInfo;
  @Input() isDetachSectionPreview: boolean;
  @Input() fieldConfigOptions: FieldConfigurationOptions;

  options: any;
  chartFields = ChartViewFields as any[];
  views = CompanyHierarchyViewLabels;
  areInitialFieldsSet = {};
  openFieldSettingsDrawer = false;
  objInfo;

  @Input() treeOptions: FieldTreeViewOptions = {
    // host: ReportUtils.getFieldTreeHostInfo(Cs360ContextUtils.getSourceDetails(this.translocoService)),
    host: ReportUtils.getFieldTreeHostInfo({
      "objectName": this.ctx.baseObject,
      "objectLabel": this.i18nService.translate(this.ctx.translatedBaseObjectLabel),
      "connectionType": "MDA",
      "connectionId": "MDA",
      "dataStoreType": "HAPOSTGRES"
    }),
    fieldSearchSetting: {...DefaultFieldSearchSetting, maintainDefaultOrder: false},
    nestOnDemand: true,
    resolveMultipleLookups: {},
    enablePartialTree: true,
    showTooltip:true,
    pageSize: 200,
    dragOptions: {
      isOutsideDroppable: true,
      isDragIndicatorRequired: true,
      isDataTypeIconRequired: true
    },
    filterFunction: this.fieldFilterFunction.bind(this),
    root: null,
    maxNestLevels: 1,
    baseObject: "company",
    fieldInfo: []
  };
  // @Input() baseObjectName = Cs360ContextUtils.getTranslatedBaseObjectName();
  @Input() baseObjectName = this.ctx.standardLayoutConfig.labelForTranslation;
  @Output() changes = new EventEmitter<any>();
  selectedFieldInfoForConfig: CompanyHierarchyColumn;
  
  constructor(private c360Service: CS360Service,
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO, private _ds: DescribeService,private i18nService: NzI18nService, private translocoService: TranslocoService) { }

  ngOnInit() {
      this.loadObject();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if(!this.viewInfo.fields || !this.viewInfo.fields.length) {
      NameField.label = this.i18nService.translate('360.admin.company_hierarchy.company_name');
      this.viewInfo.fields.push({...NameField, path: this.getFieldPath(NameField)});
    } 
    this.treeOptions = {...this.treeOptions, fieldInfo: this.viewInfo.fields};

    if (
        changes.viewInfo &&
        changes.viewInfo.currentValue &&
        changes.viewInfo.previousValue &&
        changes.viewInfo.currentValue.label !== changes.viewInfo.previousValue.label &&
        this.objInfo
    ) {
      this.onViewChange();
    }
  }

  loadObject(): void {
    this._ds.getObjectTree(
        this.treeOptions.host,
        Cs360ContextUtils.getBaseObjectName(this.ctx),
        2,
        null,
        { skipFilter: true })
        .then(res => {
          this.onObjectLoaded(res);
          this.onViewChange();
        });
  }

  onObjectLoaded(obj): void {
    this.objInfo = obj;
    this.viewInfo.fields = map(this.viewInfo.fields, field => {
      const path = fieldInfo2path({leftOperand: field}, this.objInfo.children);
      const node = path[path.length - 1];
      const derivedColDatatype = this.getFieldDerivedDatatype(field);
      return {
        ...(node ? node.data : {}),
        ...field,
        hoverLabel: node ? node.data.label : field.label,
        label: field.label,
        sampleData: this.getSampleDataForField(derivedColDatatype),
        derivedColDatatype,
        // Restricting customization for indirect lookups
        customizable: !(field.dataType === DataTypes.LOOKUP && field.fieldPath) && FieldConfigurationUtils.isFieldCustomizable(field, this.fieldConfigOptions),
        path: this.getFieldPath({...field, hoverLabel: node ? node.data.label : field.label})}
    });
    if(this.isDetachSectionPreview) {
      if(this.viewInfo.label === this.views.CHART) {
        this.updateChartFields(false);
      }
    }
  }

  private fieldFilterFunction(fields: GSField[], allowedDataTypes, allowedFields, uniqueKey): GSField[] {
    return fields.filter(f => !f.meta.formulaField && f.dataType !== DataTypes.IMAGE);
  }

  getPath(field, path) {

    if (!field.fieldPath) {

      if(field.lookupName) {
        path = path + "." + (field.lookupName || "");
        if(path === ".") {path = ""}
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
  
  checkIfFieldExists(field) {
    return this.viewInfo.fields.find(f => {
      return compareFields(f, field);
    });
  }

    // NOTE: made this function to arrow function as the .bind in template triggering input changes
    fnCheckForDisable = this.fnForDisable.bind(this);

    fnForDisable(node) {
        const field = path2FieldInfo(findPath(node));
        return this.checkIfFieldExists(field);
    }

  private getFieldPath(field:CompanyHierarchyColumn, fieldPath?: string) {
    let path = fieldPath ? fieldPath : this.i18nService.translate(this.baseObjectName) + ' > ';
    if(field.fieldPath) {
      path += (field.fieldPath.right.label || field.fieldPath.right.fieldLabel) + ' > ';
      path = this.getFieldPath(field.fieldPath, path);
    }
    return (field.hoverLabel || field.label) ? path + (field.hoverLabel || field.label) : path;
  }

  private isFieldExists(field: CompanyHierarchyColumn) {
    return !!this.viewInfo.fields.find(f => compareFields(f, field));
  }

  private openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      this.c360Service.createNotification(messageType, message,5000);
    }
  }

  private updateChartFields(checkChartFields: boolean, droppedField?: CompanyHierarchyColumn, populateAllDataTypeFields = false) {
    let droppedFieldAddedAt;
    const unPopulatedChartFields = [];
    this.chartFields = this.chartFields.map((chartField, i) => {
      let field = checkChartFields ? chartField : this.viewInfo.fields.find(x => x.properties && x.properties.chartFieldIndex === i);
      const derivedColDatatype = (!field || !field.fieldName) ? "" : this.getFieldDerivedDatatype(field);
      if((!field || !field.fieldName) && droppedField && !droppedFieldAddedAt && (chartField.allowedDerivedDataTypes.includes(droppedField.derivedColDatatype) || (populateAllDataTypeFields && chartField.allowAllTypes))) {
        droppedFieldAddedAt = i;
        droppedField.properties = {...droppedField.properties, chartFieldIndex: droppedFieldAddedAt};
        field = droppedField;
      }
      if((derivedColDatatype && (!chartField.allowedDerivedDataTypes.includes(derivedColDatatype) && !(chartField.allowAllTypes && populateAllDataTypeFields))) || !field) {
        unPopulatedChartFields.push(field);
        return {...chartField};
      } else {
        return {...field, info: chartField.info, allowedDerivedDataTypes: chartField.allowedDerivedDataTypes, alowAllTypes: chartField.allowAllTypes};
      }
    });
    if(droppedField && !droppedFieldAddedAt && !populateAllDataTypeFields) {
      droppedFieldAddedAt =  this.updateChartFields(checkChartFields, droppedField, true);
    } else if(!checkChartFields && unPopulatedChartFields.length && !populateAllDataTypeFields) {
      forEach(unPopulatedChartFields, field => {
        if(field) {
          this.updateChartFields(true, field, true);
        }
      })
    }
    return droppedFieldAddedAt;
  }

  handleLabelInput(field:CompanyHierarchyColumn) {
    if (!field.showLabelInput) {
      field.showLabelInput = true;
      field.tempLabel = field.label;
    }
  }

  onViewChange() {
    if(this.fieldTreeViewWrapper) {
      this.fieldTreeViewWrapper.updateDisableStatusOfNodes();
    }
    if(!this.areInitialFieldsSet[this.viewInfo.label]) {
      this.viewInfo.fields = map(this.viewInfo.fields, field => {
        const path = fieldInfo2path({leftOperand: field}, this.objInfo.children);
        const node = path[path.length - 1];
        const selectedField: GSField = node ? node.data : {} as GSField;
        const derivedColDatatype = this.getFieldDerivedDatatype(field);
        return {
          ...field, 
          ...selectedField,
          label: field.label,
          hoverLabel: selectedField.label,
          sampleData: this.getSampleDataForField(derivedColDatatype),
          derivedColDatatype,
          // Restricting customization for indirect lookups
          customizable: !(field.dataType === DataTypes.LOOKUP && field.fieldPath) && FieldConfigurationUtils.isFieldCustomizable(selectedField, this.fieldConfigOptions),
          path: this.getFieldPath({...field, label: selectedField.label})
        }
      });
      if(this.viewInfo.label === this.views.CHART) {
        this.updateChartFields(false);
      }
      this.areInitialFieldsSet[this.viewInfo.label] = true;
      return;
    }
  }

  private getSampleDataForField(derivedColDatatype: string) {
    //{360.admin.field_selector.ge_power}= GE Power
    switch(derivedColDatatype) {
      case "NAME":
        return '360.admin.field_selector.ge_power';
      case DataTypes.CURRENCY:
        return "$141,332";
      case DataTypes.NUMBER: 
        return "141,332";
      case 'CURRENTSCORE':
      case DataTypes.STRING:
        return "xxxxx";
      case DataTypes.DATE:
      case DataTypes.DATETIME:
        return "4/1/2021";
      case DataTypes.BOOLEAN:
        return "true";
    }
  }

  private getFieldDerivedDatatype(field: CompanyHierarchyColumn) {
    if(!field.fieldPath) {
      if(field.fieldName === "CurrentScore") {
        return "CURRENTSCORE";
      }
      if(field.fieldName === "Name") {
        return "NAME";
      }
    }
    return FieldUtils.getFieldDerivedDatatype(field as any).toUpperCase();
  }

  private getChildren(field) {
    if (field.dataType === DataTypes.LOOKUP) {
      const fld = findFieldInTree(field, this.objInfo);
      if (fld) {
        return fld.children;
      }
    }
  }

  private onFieldDrop(droppedField: any) {
    const fieldInfo = path2FieldInfo(findPath(droppedField));
    const derivedColDatatype = this.getFieldDerivedDatatype(fieldInfo);
    const customizable = !(droppedField.dataType === DataTypes.LOOKUP && droppedField.parent) && FieldConfigurationUtils.isFieldCustomizable(droppedField.data, this.fieldConfigOptions);
    let field: CompanyHierarchyColumn = {
      ...droppedField.data,
      ...fieldInfo,
      hoverLabel: droppedField.data.label,
      formatOptions: {
        type: getDefaultFormat(droppedField.dataType),
        numericalSummarization: getDefaultNumericalSummarization(droppedField.dataType)
      },
      // Restricting customization for indirect lookups
      customizable: customizable,
      path: this.getFieldPath(fieldInfo),
      sampleData: this.getSampleDataForField(derivedColDatatype),
      derivedColDatatype
    }
    if (customizable) {
      field.lookupDisplayField = getLookupDisplayField(droppedField, this.getChildren(droppedField))
    }
    if(this.viewInfo.label === this.views.CHART) {
      const droppedFieldIndex = this.updateChartFields(true, field);
      if(!droppedFieldIndex) {
        const msg = this.i18nService.translate('360.admin.FieldSelectorMessage.FIELD_UNSUPPORTED_DATATYPE');
        this.openToastMessageBar({message: msg, action: null, messageType: MessageType.ERROR});
        return;
      }
      this.viewInfo.fields.push({...field, properties: {...field.properties, chartFieldIndex: droppedFieldIndex}});
    } else {
      this.viewInfo.fields.push(field);
    }
    this.treeOptions = {...this.treeOptions, fieldInfo: cloneDeep(this.viewInfo.fields)};
    setTimeout(() => {
      if (document.querySelector('.fields__list__list-view')) {
        document.querySelector('.fields__list__list-view').scrollTop = document.querySelector('.fields__list__list-view').scrollHeight + 50;
      }
    });
  }

  private checkIsValidDrop(droppedField: any): boolean {
    const path = findPath(droppedField);
    const fieldInfo = path2FieldInfo(path, {}, true);
    if(this.isFieldExists(fieldInfo) || this.viewInfo.fields.length >= this.viewInfo.fieldsLimit) {
      const msg = this.viewInfo.fields.length >= this.viewInfo.fieldsLimit ? this.i18nService.translate('360.admin.FieldSelectorMessage.FIELD_LIMIT_REACHED') : this.i18nService.translate('360.admin.FieldSelectorMessage.FIELD_EXISTS');
      this.openToastMessageBar({message: msg, action: null, messageType: MessageType.ERROR});
      this.treeOptions = {...this.treeOptions, fieldInfo: cloneDeep(this.viewInfo.fields)}; 
      return false;
    }
    return true;
  }

  onFieldDropped(event) {
    if(event.previousContainer && event.previousContainer.element.nativeElement.nodeName === "P-TREE") {
      if(this.checkIsValidDrop(event.previousContainer.data[event.previousIndex] || event.item.data)) {
        this.onFieldDrop(event.previousContainer.data[event.previousIndex] || event.item.data);
      }
      this.changes.emit(null);
      return;
    } else if(event.currentIndex !== 0) {
      moveItemInArray(this.viewInfo.fields, event.previousIndex, event.currentIndex);
      if(event.previousIndex !== event.currentIndex) {
        this.changes.emit(null);
      }
    }
  }

  onFieldConfigured(info: FieldConfigurationActionInfo) {
    if(info.action === FieldConfigurationActions.SAVE) {
      const modifiedFieldIndex = this.viewInfo.fields.findIndex(f => f.fieldName === this.selectedFieldInfoForConfig.fieldName && f.path === this.selectedFieldInfoForConfig.path);
      this.viewInfo.fields[modifiedFieldIndex] = info.field;
      if(this.viewInfo.label === this.views.CHART) {
        const index = findIndex(this.chartFields, fld => {
          if(info.field.fieldPath) {
            return fld.path === info.field.path && fld.fieldName === info.field.fieldName;
          } else  {
            return fld.fieldName === info.field.fieldName
          }
        });
        this.chartFields[index] = {...this.chartFields[index], ...info.field};
      }
      this.changes.emit(null);
    }
    this.openFieldSettingsDrawer = false;
  }

  onFieldSettingsClick(field: CustomizedField) {
    const node = findFieldInTreeByFieldPath(field, this.objInfo);
    this.selectedFieldInfoForConfig = {
      ...field,
      nameField: getLookupDisplayField(node, node.children),
      rootNode: node
    };
    this.openFieldSettingsDrawer = true;
  }

  closeFieldSettingsDrawer() {
    this.selectedFieldInfoForConfig = <any>{};
    this.openFieldSettingsDrawer = false;
  }

  onFieldDelete(field: CompanyHierarchyColumn) {
    const index = findIndex(this.viewInfo.fields, fld => {
      if(field.fieldPath) {
        return fld.path === field.path && fld.fieldName === field.fieldName;
      } else  {
        return fld.fieldName === field.fieldName && !fld.fieldPath;
      }
    });
    this.viewInfo.fields.splice(index, 1);
    if(this.viewInfo.label === this.views.CHART) {
      const index = findIndex(this.chartFields, fld => {
        if(field.fieldPath) {
          return fld.path === field.path && fld.fieldName === field.fieldName;
        } else  {
          return fld.fieldName === field.fieldName
        }
      });
      this.chartFields[index] = {...ChartViewFields[index]};
    }
    this.treeOptions = {...this.treeOptions, fieldInfo: cloneDeep(this.viewInfo.fields)}; 
    this.changes.emit(null);
    if(this.fieldTreeViewWrapper) {
      this.fieldTreeViewWrapper.updateDisableStatusOfNodes();
    }
  }

  getFields() {
      if (this.viewInfo.label === this.views.CHART) {
          this.viewInfo.fields.some(field => {
              this.chartFields.forEach(chartField => {
                  if (field.path === chartField.path) {
                      field.label = chartField.label;
                  }
              })
          })
      }
      return this.viewInfo.fields;
  }

  onClear() {
    this.viewInfo.fields = [];
    if(!this.viewInfo.fields.length) {
      NameField.label = this.i18nService.translate('360.admin.company_hierarchy.company_name');
      this.viewInfo.fields.push({...NameField, path: this.getFieldPath(NameField)});
    } 
    this.treeOptions = {...this.treeOptions, fieldInfo: this.viewInfo.fields};
    if(this.fieldTreeViewWrapper) {
      this.fieldTreeViewWrapper.updateDisableStatusOfNodes();
    }
    if(this.viewInfo.label === this.views.CHART) {
      this.chartFields = ChartViewFields as any[];
      this.updateChartFields(false);
    }
    this.changes.emit(null);
  }

  saveInput(field) {
    field.label = field.tempLabel || field.displayName || field.label;
    this.changes.emit(null);
    this.resetInput(field);
  }

  resetInput(field) {
    field.showLabelInput = false;
    delete field.tempLabel;
  }

}
