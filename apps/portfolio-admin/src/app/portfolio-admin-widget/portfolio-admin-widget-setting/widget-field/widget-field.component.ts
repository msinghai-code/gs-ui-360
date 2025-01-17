import { Component, OnInit, Input, SimpleChanges, ElementRef, OnChanges, ViewChild, AfterViewInit, EventEmitter, Output, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { sortBy, size, findIndex } from "lodash";
import { WidgetField, SidenavActions, ICockpitColumnPickerOptions, CTAFieldConfig, PortfolioFieldTreeInfo, PortfolioFieldTreeMap } from '@gs/portfolio-lib';
import { NzI18nService } from '@gs/ng-horizon/i18n';

import {
  getDatatypeIcon,
  getOriginalDataType,
} from "@gs/gdk/utils/field";

@Component({
  selector: 'gs-widget-field',
  templateUrl: './widget-field.component.html',
  styleUrls: ['./widget-field.component.scss']
})
export class WidgetFieldComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild('initialInput', {static: false}) initialInput: ElementRef;
  @Input() objectName: string;
  @Input() fieldTreeMap: PortfolioFieldTreeMap = <PortfolioFieldTreeMap>{};
  getOriginalDataType = getOriginalDataType;
  getDatatypeIcon = getDatatypeIcon;

  @Output() onInvalidStateChange = new EventEmitter<boolean>();

  showAddFields = false;
  fieldTreeInfo: PortfolioFieldTreeInfo;
  configuredFields: WidgetField[] = [];
  searchText = '';
  columnChooserConfig: ICockpitColumnPickerOptions;
  invalidDisplayNames = [];

  constructor(protected formBuilder: FormBuilder, public hostElement: ElementRef,private i18nService: NzI18nService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initialInput.nativeElement.focus();
  }

  setColumnChooserConfig(choosenFields = []) {
    this.columnChooserConfig = {
      objectNames: [this.objectName],
      baseObjectName: this.objectName,
      baseObjectFieldNames : {
        company : "CompanyId",
        relationship : "RelationshipId"
      },
      levels: 1,
      previousFields: this.configuredFields as CTAFieldConfig[],
      showCollapsibleSection: true,
      showExtraSection: false
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.fieldTreeMap && size(this.fieldTreeMap[this.objectName].fields)) {
      this.fieldTreeInfo = this.fieldTreeMap[this.objectName];
      this.setColumnChooserConfig();
      this.constructWidgetForm();
    }
  }

  modifyFields(fields: WidgetField[], setDisplayOrder?: boolean) {
    const modifiedFields = fields.map((field: WidgetField, idx) => {
      field.displayName = field.displayName || field.label;
      this.setFieldDisplayName(field);
      if(field.fieldName.toUpperCase() === "NAME") {
        if(!field.fieldPath) {
          field.disabled = true;
          field.displayOrder = 1;
        } else if(setDisplayOrder) {
          field.displayOrder = idx + 1;
        }
      }
      if(setDisplayOrder && field.fieldName.toUpperCase() !== "NAME") {
        field.displayOrder = idx + 1;
      }
      return field;
    });
    this.configuredFields = sortBy(modifiedFields, 'displayOrder');
  }

  private setFieldDisplayName(field: WidgetField) {
    if(field.displayName !== field.label) {
      return;
    }
    try {
      if(field.fieldPath.right.fieldLabel) {
        field.displayName = field.fieldPath.right.fieldLabel + " " + field.displayName;
      }
    }
    catch {
      field.displayName = field.displayName;
    }
  }

  onAction(event) {
    const { action } = event;
    this.showAddFields = false;
    if (action === SidenavActions.SAVE) {
      this.constructWidgetForm();
    }
  }

  dropField(event: CdkDragDrop<string[]>) {
    if(event.currentIndex !== 0) {
      moveItemInArray(this.configuredFields, event.previousIndex, event.currentIndex);
      this.modifyFields(this.configuredFields, true);
    }
  }

  remove(item: WidgetField) {
    item.selected = false;
    this.configuredFields = this.configuredFields.filter(f => f.selected);
    this.fieldTreeInfo.selectedFields = this.configuredFields;
    this.constructWidgetForm();
  }

  constructWidgetForm() {
    this.modifyFields(this.fieldTreeInfo.selectedFields);
    this.columnChooserConfig.previousFields = this.configuredFields as CTAFieldConfig[];
  }

  setValid(event: any, field: WidgetField) {
    if(!(event.target.value && event.target.value.length > 0)) {
      this.invalidDisplayNames.push(field.fieldName);
    } else {
      const index = findIndex(this.invalidDisplayNames, name => name === field.fieldName);
      if(index !== -1) {
        this.invalidDisplayNames.splice(index, 1);
      }
    }
    this.onInvalidStateChange.emit(this.invalidDisplayNames.length !== 0);
  }

  resolveIcon(datatype: string): string {
    if (datatype.toLowerCase() === 'percentage') {
      return 'datatype:percentage-data-type';
    } else {
      return 'datatype:' + datatype.toLowerCase();
    }
  }
}

@Pipe({name: 'getDataType'})
export class DataTypePipe implements PipeTransform {
  transform(dataType: string): string {
    switch(dataType) {
      case "datetime":
        return "date-time";
      case "sfdcid":
        return "gsid";
      case "multiselectdropdownlist":
        return "multi-picklist";
      case "url":
        return "string";
      case "lookup":
        return "gsid";
        case "percentage":
         return "percentage-data-type";
      default:
        return dataType;
    }
  }
}
