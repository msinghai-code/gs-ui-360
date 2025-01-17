import { Component, Inject, OnInit } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { ICellEditorParams } from '@ag-grid-community/core';
import { FieldEditorValueChangeInfo } from '../../pojos/portfolio-interfaces';
import { DataTypes } from '../../pojos/portfolio-enums';
import { getFieldId, isLookupField } from '../../portfolio-widget-utils';;
import { PortfolioWidgetService } from '../portfolio-widget.service';
import { PORTFOLIO_WIDGET_CONSTANTS } from '../../pojos/portfolio.constants';

@Component({
    selector: 'gs-portfolio-cell-editor',
    templateUrl: './portfolio-cell-editor.component.html',
    styleUrls: ['./portfolio-cell-editor.component.scss']
})
export class PortfolioCellEditorComponent implements OnInit, ICellEditorAngularComp {

    params: ICellEditorParams;
    field: any;
    value: any;

    constructor(private portfolioWidgetService: PortfolioWidgetService) {
    }

    getValue() {
        this.field.value = this.value;
        return this.value;
    }

    agInit(params: any): void {
        this.params = params;
        if(this.portfolioWidgetService.getFieldSelectedForEdit()) {
            this.portfolioWidgetService.setFieldSelectedForEdit(null);
            params.api.stopEditing();
            return;
        }
        this.field = this.portfolioWidgetService.getFieldMeta(params.field, params.objectName);
        if(this.field.dataType === DataTypes.PICKLIST && this.field.meta.dependentPicklist) {
            const controllerValue = params.data[params.objectName + "_" + this.field.meta.controllerName].k;
            this.field.options = this.portfolioWidgetService.getFilteredOptions(this.field.meta.properties.PICKLIST_CATEGORY_ID, controllerValue, this.field.options);
        }
        if(isLookupField(this.field)) {
            this.field.dataType = DataTypes.LOOKUP;
        } 
        if(this.field.dataType === DataTypes.CURRENCY && !params.value.p) {
            const currencyData = params.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME ? 
            params.data[PORTFOLIO_WIDGET_CONSTANTS.COMPANY_CURRENCYISOCODE_FIELDNAME] : 
            params.data[PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_CURRENCYISOCODE_FIELDNAME];
            params.value.p = currencyData ? currencyData.fv : window['GS'].gsCurrencyConfig ? window['GS'].gsCurrencyConfig.currencyIsoCode : "";
        }
        this.field.value = this.value = params.value;
        this.portfolioWidgetService.setFieldSelectedForEdit(this.field);
    }

    ngOnInit() {

    }

    onPoupupClosed(opened: boolean) {
        if(!opened) {
            this.params.api.stopEditing();
        }
    }

    onValueUpdated(updatedValue: FieldEditorValueChangeInfo) {
        this.value.inlineEditData = updatedValue[getFieldId(this.field)];
    }

    onStatusUpdated(errors) {
        const isInvalid = errors[getFieldId(this.field)];
        if(isInvalid) {
            this.value.isInvalid = true;
            this.value.inlineEditData = null;
        }
    }
}