import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataTypes, FieldEditorValueChangeInfo, getFieldId, getLookupObject, isLookupField, WidgetField } from '@gs/portfolio-lib';
import { PortfolioWidgetService } from '@gs/portfolio-lib/src/portfolio-widget-grid/portfolio-widget.service';
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import size from "lodash/size";

interface DataRow {
    rowId: string;
    value: any;
    fields: WidgetField[]; // Putting it as array as field-editor accepts array of fields
    valid: boolean;
    allOptions?: any[];
}
@Component({
  selector: 'gs-portfolio-bulk-edit-modal',
  templateUrl: './portfolio-bulk-edit-modal.component.html',
  styleUrls: ['./portfolio-bulk-edit-modal.component.scss']
})
export class PortfolioBulkEditModalComponent implements OnInit {

    @Input() fields: WidgetField[];

    dataRows: DataRow[] = [];
    unSelectedFields: WidgetField[];
    data = {};
    valid = true;

    @Output() formValueUpdated = new EventEmitter<FieldEditorValueChangeInfo>();

    constructor(private portfolioWidgetService: PortfolioWidgetService) {}

    ngOnInit() {
        this.unSelectedFields = cloneDeep(this.fields);
        this.addRow("0");
    }

    private setPicklistOptionsAndRefreshRow(field: WidgetField, row: DataRow, refresh = false) {
        if(field.meta && field.meta.dependentPicklist) {
            row.allOptions = size(row.allOptions) ? row.allOptions : cloneDeep(field.options);
            if(this.data[field.meta['controllerName']]) {
                const picklistCategoryId = field.meta && field.meta.properties && field.meta.properties['PICKLIST_CATEGORY_ID'];
                const newOptions = this.portfolioWidgetService.getFilteredOptions(picklistCategoryId, this.data[field.meta['controllerName']].k, row.allOptions);
                if(!isEqual(newOptions, field.options.filter(opt => opt.label !== "None")) && refresh) {
                    delete this.data[field.fieldName];
                    row.fields = [{...field, options: newOptions}];
                } else {
                    field.options = newOptions;
                }
            } else if(field.options.length){
                field.options = [];
                if(refresh) {
                    delete this.data[field.fieldName];
                    row.fields = [{...field, options: []}];
                }
            }
        }
    }

    private resetRow(row: DataRow) {
        row.valid = true;
        const field = row.fields[0];
        if(field.meta.dependentPicklist) {
            field.options = row.allOptions;
        }
        this.unSelectedFields.push({...field});
        if(this.data && this.data[row.fields[0].fieldName]) {
            delete this.data[row.fields[0].fieldName];
            this.formValueUpdated.emit({...this.data, valid: this.valid});
        }
    }

    addRow(rowId?: any) {
        this.dataRows.push({
          rowId: rowId.toString(),
          fields: [],
          value: null,
          valid: true
        });
    }

    minusRow(index) {
        if(this.dataRows[index].fields.length) {
           this.resetRow(this.dataRows[index]);
        }
        this.dataRows.splice(index, 1);
    }

    onFieldSelected(field: WidgetField, row: DataRow, index: number) {
        if(isLookupField(field)) {
            field.dataType = DataTypes.LOOKUP;
        }
        if(row.fields.length) {
            this.resetRow(row);
        }
        this.setPicklistOptionsAndRefreshRow(field, row);
        row.fields = [{...field}];
        row.rowId = field.fieldPath ? index.toString() + getLookupObject(field) + getFieldId(field) : index.toString() + getFieldId(field);
        this.unSelectedFields = this.unSelectedFields.filter(f => {
            if(field.fieldPath) {
              return !(f.fieldName === field.fieldName && f.fieldPath && f.fieldPath.lookupId === field.fieldPath.lookupId);
            } else {
              return !(f.fieldName === field.fieldName && !f.fieldPath);
            }
        });
    }

    updateRowStatus(errors: any, row: DataRow) {
        row.valid = isEmpty(errors);
    }

    updateFormData(data: FieldEditorValueChangeInfo) {
        this.valid = data.valid;
        delete data.valid;
        this.data = {...this.data, ...data};
        this.dataRows.forEach(row => {
            this.setPicklistOptionsAndRefreshRow(row.fields[0], row, true);
            if(!row.valid) {
                this.valid = false;
            }
        });
        this.formValueUpdated.emit({...this.data, valid: this.valid});
    }

}
