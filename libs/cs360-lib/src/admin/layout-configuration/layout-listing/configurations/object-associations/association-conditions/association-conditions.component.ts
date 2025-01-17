import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { forEach, keys } from 'lodash';

@Component({
  selector: 'gs-association-conditions',
  templateUrl: './association-conditions.component.html',
  styleUrls: ['./association-conditions.component.scss']
})
export class AssociationConditionsComponent implements ICellRendererAngularComp, OnInit {

  params: ICellRendererParams;
  filter: any;
  conditions = [];
  
  constructor() { }

  agInit(params: any): void {
    this.params = params;
    this.filter = this.params.value;
    forEach(keys(this.filter), key => {
      try {
        this.filter[key].forEach(cond => {
          cond.leftOperand.objectLabel = this.params.data.objectLabel;
          cond.leftOperandTooltip = this.getFieldLabel(cond.leftOperand, true);
          cond.filterFieldTooltip = this.getFieldLabel(cond.filterField);
        });
        this.conditions = this.conditions.concat(this.filter[key]);
      }
      catch {}
    })
  }

  getFieldLabel(field, isLeftOperand?: boolean) {
    if(field.properties && field.properties.pathLabel) {
      return field.properties.pathLabel;
    }
    let completeFieldPath ="";
    if (!field.fieldPath) {
      const objectLabel = field.objectLabel || field.objectName;
      const baseObject = objectLabel.charAt(0).toUpperCase() + objectLabel.substr(1).toLowerCase();
      completeFieldPath = baseObject + " ➝ " + field.label;
    } else {
      let fieldPath = field.fieldPath;
      const objectLabel = isLeftOperand ? field.objectLabel : fieldPath.right.objectLabel || fieldPath.right.objectName;
      const baseObject = objectLabel.charAt(0).toUpperCase() + objectLabel.substr(1).toLowerCase();
      completeFieldPath = baseObject;
      while (fieldPath) {
          completeFieldPath += " ➝ " + (fieldPath.right.label || fieldPath.right.fieldName);
          fieldPath = fieldPath.fieldPath;
      }
      completeFieldPath += " ➝ " + field.label;
    }
    return completeFieldPath;
  }

  ngOnInit() {

  }

  refresh(params: any): boolean {
      return false;
  }

}