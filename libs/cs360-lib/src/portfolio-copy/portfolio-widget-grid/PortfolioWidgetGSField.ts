import { Injectable } from '@angular/core';
// import { FieldUtils, IReportGSField } from '@gs/core';
import { FieldUtils, ReportGSField } from '@gs/report/utils';
import { IReportGSField } from "@gs/report/pojos"

@Injectable()
export class PortfolioWidgetGSField extends ReportGSField {

    selected: boolean;
    editable: boolean;
    deletable: boolean;
    hidden: boolean;
    editDisabled: boolean;
    mappings?: {
        GAINSIGHT?: {
          key?: string;
          dataType?: string;
        };
        SFDC?: {
          key?: string;
          dataType?: string;
        };
      };; 
    dependentPicklistInfo: any;

    constructor() {
        super();
    }

    setPortfolioWidgetGSField(field: any) {
        this.setLabel(field.label);
        this.setHidden(field.hidden);
        this.setScale(field.meta.precision || field.meta.decimalPlaces || 0);
        this.setType(field.type);
        this.setFieldName(field.fieldName);
        this.setDBName(field.dbName);
        this.setDataType(field.meta.originalDataType);
        this.setFieldType(field.fieldType);
        // `groupableByDate` is set for allow grouping on SFDC datetime field.
        this.setGroupable(FieldUtils.isFieldGroupable(field));
        this.setObjectName(field.objectName);
        this.setProperties(field.properties);
        this.setDisplayOrder(field.displayOrder);
        this.setSortable(field.meta.sortable);
        this.setFilterable(field.meta.filterable);
        this.setColumnWidth(field.columnWidth);
        this.setObjectDBName(field.objectDBName);
        this.setRowGrouped(field.rowGrouped);
        this.setPivot(field.pivoted);
        this.setOrderByInfo(field.pivoted);
        this.setExpressionDetails(field.expressionDetails);
        this.setFieldPath(field); // caution here
        this.setFieldAlias(field.fieldAlias);
        this.setDisplayName(field.label);
        this.setSelected(field.selected);
        this.setEditDisabled(field.editDisabled);
    }

    setDependentPicklistInfo(info: any) {
        this.dependentPicklistInfo = info;
    }

    getDependentPicklistInfo() {
        return this.dependentPicklistInfo;
    }

    setHidden(hidden: boolean) {
        this.hidden = hidden === undefined ? false : hidden;
    }

    setEditDisabled(editDisabled: boolean) {
        this.editDisabled = editDisabled;
    }

    getEditDisabled() {
        return this.editDisabled;
    }

    getHidden() {
        return this.hidden;
    }

    setFieldPath(field) {
        this.fieldPath = field.fieldPath;
    }

    getFieldPath() {
        return this.fieldPath;
    }

    setSelected(selected: boolean) {
        this.selected = selected;
    }

    getSelected() {
        return this.selected;
    }

    setDeletable(deletable: boolean) {
        this.deletable = deletable;
    }

    getDeletable() {
        return this.deletable;
    }

    getEditable() {
        return this.editable;
    }

    setEditable(editable: boolean) {
        this.editable = editable;
    }

    public toJSON(): IReportGSField {
        return {
          label: this.getLabel(),
          scale: this.getScale(),
          type: this.getType(),
          hidden: this.getHidden(),
          fieldAlias: this.getFieldAlias(),
          fieldPath: this.getFieldPath(),
          fieldName: this.getFieldName(),
          fieldType: this.getFieldType(),
          dbName:  this.getDBName(),
          dataType: this.getDataType(),
          groupable:  this.getGroupable(),
          objectName:  this.getObjectName(),
          displayName:  this.getDisplayName(),
          displayOrder:  this.getDisplayOrder(),
          sortable:  this.getSortable(),
          filterable:  this.getFilterable(),
          columnWidth:  this.getColumnWidth(),
          objectDBName: this.getObjectDBName(),
          rowGrouped: this.getRowGrouped(),
          pivoted: this.getPivot(),
          expressionDetails: this.getExpressionDetails(),
          properties: this.getProperties(),
          selected: this.getSelected(),
          editable: this.getEditable(),
          deletable: this.getDeletable(),
          editDisabled: this.getEditDisabled(),
          dependentPicklistInfo: this.getDependentPicklistInfo()
        };
    }
    
}
