import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { WidgetField } from '../../pojos/portfolio-interfaces';

@Component({
    selector: 'gs-portfolio-cell-renderer',
    templateUrl: './portfolio-cell-renderer.component.html',
    styleUrls: ['./portfolio-cell-renderer.component.scss']
})
export class PortfolioCellRendererComponent implements OnInit, ICellRendererAngularComp {

    params: ICellRendererParams;
    field: WidgetField;
    value: any;
    inlineEditGrid = false;

    constructor() {}

    agInit(params: any): void {
        this.params = params;
        this.inlineEditGrid = params.isInlineEditGrid;
        this.field = params.field;
        this.field.value = params.value && params.value.inlineEditData ? params.value.inlineEditData.fv : params.valueFormatted;
    }

    ngOnInit() {

    }

    refresh(params: any): boolean {
        return false;
    }
}