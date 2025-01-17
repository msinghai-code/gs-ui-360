import { Injectable } from '@angular/core';
import {ExpressionDetails, FieldType, OrderByInfo, PortfolioGSField} from "../pojos/portfolio-interfaces";
import {FieldUtils} from "../utils/FieldUtils";

@Injectable()
export class PortfolioWidgetGSField {

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
      };
    dependentPicklistInfo: any;

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

    public toJSON(): PortfolioGSField {
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

    label = "";
    scale = 0;
    type = "";
    fieldAlias = "";
    fieldName = "";
    fieldPath: any = null;
    fieldType: FieldType = 'value';
    dbName = "";
    dataType = "";
    groupable = false;
    objectName = "";
    displayName = "";
    displayOrder = 0;
    sortable = false;
    filterable = false;
    columnWidth = "0";
    objectDBName = "";
    rowGrouped = false;
    pivoted = false;
    orderByInfo: OrderByInfo;
    expressionDetails: ExpressionDetails;
    properties: any;

    constructor() {}

    setReportGSField(iField: any) {
        const field = iField.data;
        this.setLabel(field.label);
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
        this.setFieldPath(iField);
        this.setFieldAlias(field.fieldAlias);
        this.setDisplayName(field.label);
    }

    public setLabel(label: string) {
        this.label = label;
    }

    public getLabel() {
        return this.label;
    }

    public setScale(scale: number) {
        this.scale = FieldUtils.getDecimalPlaces(scale, {min: 0, max: 3});
    }

    public getScale() {
        return this.scale;
    }

    public setFieldAlias(fieldAlias?: string) {
        try {
            if (!!fieldAlias) {
                this.fieldAlias = fieldAlias.toLowerCase();
            } else {
                this.fieldAlias = FieldUtils.constructFieldAlias(this.toJSON());
            }
        } catch(e){
            console.error(e);
        }
    }

    public getFieldAlias() {
        return this.fieldAlias;
    }

    public setType(type: string) {
        this.type = type;
    }

    public getType() {
        return this.type;
    }

    public setFieldName(fieldName: string) {
        this.fieldName = fieldName;
    }

    public getFieldName() {
        return this.fieldName;
    }

    public setDBName(dbName: string) {
        this.dbName = dbName;
    }

    public getDBName() {
        return this.dbName;
    }

    public setDataType(originalDataType: string) {
        this.dataType = originalDataType;
    }

    public getDataType() {
        return this.dataType;
    }

    public setFieldType(fieldType: FieldType) {
        this.fieldType = fieldType;
    }

    public getFieldType() {
        return this.fieldType;
    }

    public setGroupable(groupable: boolean) {
        this.groupable = groupable;
    }

    public getGroupable() {
        return this.groupable;
    }

    public setObjectName(objectName: string) {
        this.objectName = objectName;
    }

    public getObjectName() {
        return this.objectName;
    }

    public setDisplayOrder(displayOrder: number) {
        this.displayOrder = displayOrder;
    }

    public getDisplayOrder() {
        return this.displayOrder;
    }

    public setSortable(sortable: boolean) {
        this.sortable = sortable;
    }

    public getSortable() {
        return this.sortable;
    }

    public setFilterable(filterable: boolean) {
        this.filterable = filterable;
    }

    public getFilterable() {
        return this.filterable;
    }

    public setColumnWidth(columnWidth: string) {
        this.columnWidth = columnWidth;
    }

    public getColumnWidth(): string {
        return this.columnWidth;
    }

    public setRowGrouped(rowGrouped: boolean) {
        this.rowGrouped = rowGrouped;
    }

    public getRowGrouped(): boolean {
        return this.rowGrouped;
    }

    public setObjectDBName(objectDBName: string) {
        this.objectDBName = objectDBName;
    }

    public getObjectDBName(): string {
        return this.objectDBName;
    }

    public setPivot(pivoted: boolean) {
        this.pivoted = pivoted;
    }

    public getPivot(): boolean {
        return this.pivoted;
    }

    public setOrderByInfo(orderByInfo: OrderByInfo) {
        this.orderByInfo = orderByInfo;
    }

    public getOrderByInfo() {
        return this.orderByInfo;
    }

    public setExpressionDetails(expressionDetails: any) {
        this.expressionDetails = expressionDetails;
    }

    public getExpressionDetails(): ExpressionDetails {
        return this.expressionDetails;
    }

    public setProperties(properties: any) {
        this.properties = {...this.properties, ...properties};
    }

    public getProperties() {
        return this.properties;
    }


    public getDisplayName(): string {
        return this.displayName;
    }

    public setDisplayName(value: string) {
        this.displayName = value;
    }
    
}
