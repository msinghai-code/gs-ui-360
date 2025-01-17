import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { GSField } from "@gs/gdk/core";
import { ColumnPickerComponent, getFieldMeta, ICockpitColumnPickerOptions, PortfolioFieldTreeInfo, PortfolioWidgetGSField } from '@gs/portfolio-lib';
import forEach from "lodash/forEach";
import find from "lodash/find";
import findIndex from "lodash/findIndex";

@Component({
    selector: 'gs-portfolio-column-chooser',
    templateUrl: './portfolio-column-chooser.component.html',
    styleUrls: ['./portfolio-column-chooser.component.scss']
})
export class PortfolioColumnChooserComponent implements OnInit, OnChanges {

    @ViewChild('columnPicker', { static: false }) columnPicker: ColumnPickerComponent;

    @Input() objectName: string;
    @Input() config: ICockpitColumnPickerOptions;
    @Input() fieldTree: PortfolioFieldTreeInfo;
    @Input() filterFields: PortfolioWidgetGSField[];
    @Output() save = new EventEmitter();
    @Output() cancel = new EventEmitter();

    columnChooserVisible: boolean;
    private initialFields;
    private configSet = false;

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if(this.config.baseObjectName === this.objectName && this.fieldTree && this.fieldTree.fields.length) {
            this.filterFields = this.filterFields.filter(field => !field.hidden);
            this.initialFields = this.getSelectedFieldsMeta(this.filterFields);
            this.config.previousFields = this.getSelectedFieldsMeta(this.config.previousFields);
            this.config.selectablefunction = this.selectablefunction.bind(this);
            this.configSet = true;
        }
    }

    selectablefunction(field, key):boolean{
        const index = findIndex(this.initialFields, f => key === (f.objectName || "") + "$" + f.fieldName)
        return index !== -1;
    }

    private getSelectedFieldsMeta(fields) {
        const fieldMetas = [];
        forEach(fields, field => {
          const fieldMeta = getFieldMeta(field, this.fieldTree, this.config.baseObjectName);
          fieldMeta.label = field.displayName;
          fieldMeta.properties = fieldMeta.properties || {};
          fieldMeta.properties.updateable = true;
          fieldMeta.properties.uiTreeRootNode = this.config.baseObjectName;
          fieldMetas.push(fieldMeta);
        })
        return fieldMetas;
    }

    onSave() {
        this.save.emit(this.columnPicker.getSelectedFields().objectsFields);
        this.columnChooserVisible = false;
    }

    onClose() {
        this.cancel.emit();
        this.columnChooserVisible = false;
    }


    fieldFilterFunction(fields: GSField[], allowedDataTypes, allowedFields, uniqueKey): GSField[] {
        const filteredFields = [];
        fields.forEach((field: any) => {
            let isInitial = true;
            const initialField = find(this.initialFields, f => {
                if(uniqueKey && f.dbName === field.dbName && f.objectDBName === field.objectDBName && f.fieldPath && f.fieldPath.right.fieldName === uniqueKey) {
                    return true;
                } else if(!uniqueKey && f.dbName === field.dbName && f.objectDBName === field.objectDBName && !f.fieldPath) {
                    return true;
                } else if(f.fieldPath && f.fieldPath.right.dbName === field.dbName && !uniqueKey) {
                    isInitial = false;
                    return true;
                } else if(f.fieldPath && field.fieldName === "CompanyId" && f.fieldPath.right.fieldName === field.fieldName) {
                    isInitial = false;
                    return true;
                }
                return false;
            });
            if(initialField) {
                field.label = isInitial ? initialField.label : field.label;
                filteredFields.push(field);
            }
        });
        return filteredFields;
    }


}
