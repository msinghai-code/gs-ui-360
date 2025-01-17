import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { GSField } from "@gs/gdk/core";
import { SidenavActions, ICockpitColumnPickerOptions, DataTypes, ColumnPickerComponent, PortfolioFieldTreeInfo, getFieldMeta, isFieldEditDisabled } from '@gs/portfolio-lib';
import { forEach, find } from 'lodash';

@Component({
  selector: 'gs-add-widget-field',
  templateUrl: './add-widget-field.component.html',
  styleUrls: ['./add-widget-field.component.scss']
})
export class AddWidgetFieldComponent implements OnInit, OnChanges {

  @ViewChild('columnPicker', { static: false }) columnPicker: ColumnPickerComponent;

  @Input() fieldTreeInfo: PortfolioFieldTreeInfo;
  @Input() config: ICockpitColumnPickerOptions;

  @Output() action: EventEmitter<any> = new EventEmitter();

  isValidDependentPicklist = true;
  controllerFields = "";

  constructor() { }

  ngOnInit() {
    this.config.previousFields = this.getSelectedFieldsMeta(this.config.previousFields);
  }

  private getSelectedFieldsMeta(fields) {
    const fieldMetas = [];
    forEach(fields, field => {
      const fieldMeta = this.getSelectedField(field);
      fieldMeta.properties = fieldMeta.properties || {};
      fieldMeta.properties.updateable = true;
      fieldMeta.properties.uiTreeRootNode = this.config.baseObjectName;  
      fieldMetas.push(fieldMeta);
    })
    return fieldMetas;
}

  ngOnChanges(changes: SimpleChanges) {
  }

  onSave() {
    const selectedFields = [];
    this.controllerFields = "";
    this.isValidDependentPicklist = true;
    const objectTreeFields = this.columnPicker.getSelectedFields().objectsFields;
    this.columnPicker.getSelectedFields().objectsFields.some(f => {
      const preSelected = this.getSelectedField(f);
      let selectedField;
      if (preSelected) {
        selectedField = {...preSelected};
        delete selectedField.properties;
        selectedFields.push(selectedField);
      } else {
        selectedField = getFieldMeta(f, this.fieldTreeInfo, this.config.baseObjectName);
        selectedField.deletable = true;
        selectedField.selected = true;
        selectedField.editDisabled = isFieldEditDisabled(selectedField, this.config.baseObjectName);
        selectedFields.push(selectedField);
      }
      this.setIsValidDependentPicklist(selectedField, objectTreeFields);
    });
    if(!this.isValidDependentPicklist) {
      return;
    }
    this.fieldTreeInfo.selectedFields = selectedFields;
    this.action.emit({ action: SidenavActions.SAVE });
  }

  private setIsValidDependentPicklist(field, selectedFields: any[]) {
    if(field.meta.dependentPicklist) {
      const controllerField = getFieldMeta({fieldName: field.meta.controllerName, objectName: field.objectName, label: ""}, this.fieldTreeInfo, this.config.baseObjectName);
      if(selectedFields.findIndex(x => x.fieldName === field.meta.controllerName) === -1) {
        this.controllerFields = this.controllerFields ? this.controllerFields + ", " + controllerField.label : controllerField.label;
        this.isValidDependentPicklist = false;
        return true;
      }
    }
  }
 
  private getSelectedField(f: GSField): GSField {
    return find(this.fieldTreeInfo.selectedFields, preSelectedField => {
      if(preSelectedField.fieldPath && f.fieldPath) {
        return preSelectedField.fieldName === f.fieldName && preSelectedField.fieldPath.lookupId === f.fieldPath.lookupId;
      } else {
        return preSelectedField.fieldName === f.fieldName && !f.fieldPath && !preSelectedField.fieldPath;
      }
    });
  }

  onClose() {
    this.action.emit({ action: SidenavActions.CLOSE });
  }

  fieldFilterFunction(fields: GSField[], allowedDataTypes, allowedFields): GSField[] {
    const portfolioFieldNames = this.config.previousFields.map(item => item.fieldName);
    return fields.filter(item => {
        return item.dataType !== DataTypes.RICHTEXTAREA;
    });
  }

}
