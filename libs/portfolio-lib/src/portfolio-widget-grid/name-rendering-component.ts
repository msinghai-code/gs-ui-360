import { Component } from '@angular/core';
import { ICellRendererAngularComp } from "ag-grid-angular";
import { IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'name-renderer',
  template: `<a [appLink360]="params">{{ displayName }}</a>`,
})
export class NameRendererComponent implements ICellRendererAngularComp {
 
  params: any;
  displayName: any;

  constructor() {}

  agInit(data: any): void {
    const isCompany = data.originalColumn.objectName === "company";
    const pageContext = isCompany ? "C360" : "R360";
    this.params = {value: data.value.k,  pageContext: pageContext};
    this.displayName = data.valueFormatted;
  }

  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
      throw new Error('Method not implemented.');
  }

  refresh(): boolean {
    return false;
  }

}



