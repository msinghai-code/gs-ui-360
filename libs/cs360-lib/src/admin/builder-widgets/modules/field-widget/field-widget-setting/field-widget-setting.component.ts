import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DataTypes, FieldConfigurationOptions, findFieldInTreeByFieldPath,
  getLookupDisplayField, getSearchableFields } from '@gs/cs360-lib/src/common';
import { FieldConfigurationComponent } from '@gs/cs360-lib/src/common';
import { SummaryWidget, WidgetCategoryType, WidgetItemSubType, WidgetItemType } from '@gs/cs360-lib/src/common';
import {FieldTreeNode} from "@gs/gdk/core/types";

@Component({
  selector: 'gs-field-widget-setting',
  templateUrl: './field-widget-setting.component.html',
  styleUrls: ['./field-widget-setting.component.scss']
})
export class FieldWidgetSettingComponent implements OnInit {

  @Input() widgetItem: SummaryWidget;
  @Input() allFieldWidgets;
  field: any;
  fieldConfigOptions: FieldConfigurationOptions = {
      showEditable: true,
      showDescription: true,
      showType: true,
      showWidth: false,
      showLookupDisplayField: true,
      showSearchConfig: true,
      showDecimals: true,
      showNumericSummarization: true,
      showRequired: true
    };
  rootNode: FieldTreeNode;
  @ViewChild(FieldConfigurationComponent, { static: true }) fieldConfigurationComponent: FieldConfigurationComponent;
  constructor() { }

  ngOnInit() {
    
    this.field = { ...this.widgetItem };
    if( (WidgetCategoryType.FIELD ===   this.widgetItem.widgetCategory && this.widgetItem.config)) {    
      this.field = { ...this.widgetItem, ...this.widgetItem.config };
      
    }
    if( (WidgetItemSubType.CSM ===   this.widgetItem.subType && this.widgetItem.config)){
      this.field = { ...this.widgetItem, ...this.widgetItem.config};
    }

    if([DataTypes.BOOLEAN.toString()].includes(this.field.dataType)) {
      this.fieldConfigOptions.showRequired = false;
    }
    const node = findFieldInTreeByFieldPath(this.field, this.allFieldWidgets);
    this.rootNode = {...node};
    this.field = {
      ...this.field,
      nameField: getLookupDisplayField(node, node && node.children),
      searchableFields: getSearchableFields(node, this.field)
    };
  }

  isValid() {
    return this.fieldConfigurationComponent.fieldConfigForm.valid;
  }

  toJSON() {
    this.fieldConfigurationComponent.submitForm();
    if (!this.isValid()) {
      return { isValid: false };
    }
    this.field = this.fieldConfigurationComponent.toJSON();
    return { isValid: true, id: this.widgetItem.itemId, config: { ...this.widgetItem, ...this.field } };

  }
}
