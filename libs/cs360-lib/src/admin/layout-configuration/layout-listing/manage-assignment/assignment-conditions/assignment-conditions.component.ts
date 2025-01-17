import { Component, Inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { includes,flatten, isEmpty } from 'lodash';
import { ICellRendererParams, GridApi } from '@ag-grid-community/core';
import {GSGlobalFilter} from "@gs/gdk/filter/global/core/global-filter.interface";
import { AssignmentCondition } from '../manage-assignment.service';
import { CALENDER_DATE_LITERALS } from '@gs/gdk/core';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-assignment-conditions',
  templateUrl: './assignment-conditions.component.html',
  styleUrls: ['./assignment-conditions.component.scss']
})
export class AssignmentConditionsComponent implements ICellRendererAngularComp, OnInit {

  params: ICellRendererParams;
  filter: GSGlobalFilter;
  isDefault: boolean;
  gridApi: GridApi;
  rowData;
  case:boolean=false;
  
  
  constructor() { }

  agInit(params: any): void {
    this.params = params;
    this.isDefault = this.params.data.default;
    this.filter = this.params.value;
    this.gridApi = params.api;
    this.rowData = params.data;
    if(!isEmpty(this.filter) || this.isDefault){
      this.case=true;
    }
  }

  ngOnInit() {  

  }
  

  refresh(params: any): boolean {
      return false;
  }

  toggleShowMore() {
    this.rowData.showAllConditions = !this.rowData.showAllConditions;
    this.gridApi.resetRowHeights();
    setTimeout(() => {
      this.params.columnApi.autoSizeColumn("filter");
    })
  }
}


@Pipe({
  name: "filterValue"
})
export class FilterValueFormatPipe implements PipeTransform {

  constructor(private i18nService : NzI18nService) { }

  transform(filterValue: any = {}, cond: AssignmentCondition): any {
    if(!cond) {
      return filterValue;
    }
    if(['IS_NULL', 'IS_NOT_NULL'].indexOf(cond.comparisonOperator) !== -1) {
      return this.i18nService.translate('360.admin.manage_assignment.null');
    }
    if(cond.describeField && ["MULTISELECTDROPDOWNLIST", "PICKLIST"].includes(cond.leftOperand.dataType)) {
      let labels = "";
      cond.describeField.options.forEach(opt => {
        if(includes(filterValue, opt.value)) {
          labels += labels ? ", " + opt.label : opt.label;
        }
      })
      return labels;
      //{360.admin.manage_assignement.all_users}=All Users
      //{360.admin.manage_assignement.current_users}=Current User
    } else if(cond.filterValue && cond.filterValue.userLiteral) {
      if (cond.filterValue.userLiteral === "ALL_USERS") {
        return this.i18nService.translate('360.admin.filter_query.allUser');
      } else if (cond.filterValue.userLiteral === "CURRENT_USER") {
        return  this.i18nService.translate('360.admin.filter_query.currentUser');
      } else if (cond.value && cond.value.length > 0) {
        return cond.value.map(val => val.name).join(",");
      }
    } else if(cond.filterValue && cond.filterValue.dateLiteral) {
      if(cond.filterValue.dateLiteral === "CUSTOM") {
        return cond.filterValue.value && cond.filterValue.value[0];
      } else {
        const allOptions = CALENDER_DATE_LITERALS.map(category => category.options);
        const selected = flatten(allOptions).find(opt => opt.value === cond.filterValue.dateLiteral);
        return selected && selected.label;
      }
    } else if(cond.leftOperand.dataType === "LOOKUP") {
      return cond.value && cond.value.map(val => val.name).join(",");
    } 
    return filterValue;
  }
}
