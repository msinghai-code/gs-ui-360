import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FilterQueryBuilderComponent } from "@gs/gdk/filter/builder";
import { filter, forEach, find, orderBy, cloneDeep } from 'lodash';
import { DEFAULT_COLUMNS } from '../constants';
import { CompaniesFilterInfo } from '../interfaces';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import { GSField } from "@gs/gdk/core";
import { DataTypes } from '../constants';

@Component({
  selector: 'gs-actions-header',
  templateUrl: './actions-header.component.html',
  styleUrls: ['./actions-header.component.scss']
})
export class ActionsHeaderComponent implements OnInit, OnDestroy {

  @ViewChild("popoverEle", { static: false }) private popOver: NzOverlayComponent;
    @ViewChild("morePopoverEle", { static: false }) private morePopOver: NzOverlayComponent;
  @ViewChild("filterPopover", { static: false }) private _filterpop: NzOverlayComponent = null;
  @ViewChild('fqb', { static: false }) private _fqb: FilterQueryBuilderComponent;

  @Input() set numberOfRows(value: number) {
    this.displayHeaderCount = value;
  } 
  @Input() fields: any[];
  @Input() addButtonLabel: string;
  @Input() selectedObjectName: string;
  @Input() menuItems: any[];
  @Input() filterInfo: any;
  @Input() initialDisplayHeader: string;
  @Input() set selectedRows(rows: any[]) {
    this._selectedRows = rows || [];
  } 
  
  @Output() fieldsUpdated = new EventEmitter<any[]>();
  @Output() filterInfoChanged = new EventEmitter<CompaniesFilterInfo>();
  @Output() buttonClicked = new EventEmitter<{button: string}>();
  @Output() menuItemSelected = new EventEmitter<any>();
  
  selectedColumns = DEFAULT_COLUMNS;
  displayHeaderCount: number;
  _selectedRows: any[] = [];
  disabledColumns: any[] = [];
  showFilters = false;
  invalid = true;
  clonedFields: any[];
  inputValueSettings = {
      showMore: false,
      selectionLimit: 10,
      byPassValidation: false
  }

  private componentSubscription: any = new Subject<void>();
  
  constructor() {
  }
  
  ngOnInit() {
    this.clonedFields = cloneDeep(this.fields);
    this.setSelectedColumns();
    this.clonedFields = orderBy(this.clonedFields, field => field.label.toUpperCase(), 'asc');
    this.disabledColumns = DEFAULT_COLUMNS;
  }
  
  private setSelectedColumns() {
    this.selectedColumns = filter(this.clonedFields, field => !field.hidden);
  }

  openTreePopover(evt) {
    this.popOver.open(new ElementRef(evt.target));
  }

  openMorePopover(evt) {
    this.morePopOver.open(new ElementRef(evt.target));
  }

  applyMultiSelect(event) {
    const selected = (event.value || []);
    const newFields = [];
    this.clonedFields.forEach(field => {
      field.hidden = !selected.includes(field.fieldName);
      newFields.push(field);
    });
    this.popOver.close();
    this.fieldsUpdated.emit(cloneDeep(newFields));
  }

  openFilters(evt) {
    this.showFilters = true;
    this._filterpop
      .open(new ElementRef(evt.target))
      .pipe(takeUntil(this.componentSubscription))
      .subscribe(() => {
        this.showFilters = false;
      });
  }
  
  cancelMultiSelect(event) {
    this.setSelectedColumns();
    this.popOver.close();
  }

  close() {
    this.showFilters = false;
    this._filterpop.close();
  }

  filterValidityUpdate(data) {
    this.invalid = data.invalid;
  }

  applyFilters() {
    const data = this._fqb.serialize();
    this.filterInfo.filterInfo = data;
    const filterConditions = this.transformFilterConditions(data);
    const filterInfoToEmit = {
      filterConditions,
      filterInfo: this.filterInfo,
      query: null
    };
    this.filterInfoChanged.emit(cloneDeep(filterInfoToEmit));
  }

  transformFilterConditions(data) {
    if (data && data.expression && data.conditions && data.conditions.length > 0) {
      const transformedObject = { expression: data.expression, conditions: [] };
      if (data && data.conditions) {
        forEach(data.conditions, (condition) => {
          const alias = condition['filterAlias'];
          const leftOperand = condition['leftOperand'];
          const fieldName = leftOperand['fieldName'];
          let operator = condition['comparisonOperator'];
          const values = condition['filterValue']['value'];
          let tempValue = [];
          if (leftOperand.dataType === 'PICKLIST' || leftOperand.dataType === 'MULTISELECTDROPDOWNLIST') {
            const picklistObj = find(this.clonedFields, (item => {
              return item.fieldName === fieldName;
            }));
            if (picklistObj) {
              const options = picklistObj.options;
              forEach(values, function (value) {
                const picklistValue = find(options, (item => {
                  return item.value === value;
                }));
                if (picklistValue) {
                  tempValue.push(picklistValue.label);
                }
              });
            }
          }
          // This code is wriiten for to support equals and not equals all user case.
          else if (leftOperand.dataType === 'LOOKUP' && values && values.indexOf('ALL_USERS') > -1 && (operator === 'NE' || operator === 'EQ')) {
            if (operator === 'NE') {
              operator = 'IS_NULL';
              tempValue = undefined;
            } else {
              operator = 'IS_NOT_NULL';
              tempValue = undefined;
            }
          } else if (leftOperand.dataType === 'MULTISELECTDROPDOWNLIST') {
            if (operator === 'IS_NULL' || operator === 'IS_NOT_NULL') {
              tempValue = [];
            }
          }
          else {
            tempValue = values;
          }
          transformedObject.conditions.push({ alias, name: fieldName, operator, value: tempValue });
        });
      }
      return transformedObject;
    }
    else {
      return null;
    }
  }

  resetFilters() {
    this.filterInfo.filterInfo = { conditions: [], expression: '' };
    const filterInfoToEmit = {
      filterConditions: null,
      filterInfo: this.filterInfo,
      query: null
    };
    this.filterInfoChanged.emit(cloneDeep(filterInfoToEmit));
  }

  onButtonClicked(button: string) {
    this.buttonClicked.emit({button: button});
  }

  onMenuItemClick(item: {label: string}) {
    this.menuItemSelected.emit(item);
  }

  fieldFilterFunction = (function(fields: GSField[]): GSField[] {
    return fields.filter(item => {
        return item.dataType !== DataTypes.IMAGE;
    });
  });

  ngOnDestroy() {
    this.componentSubscription.next();
    this.componentSubscription.complete();
  }

}
