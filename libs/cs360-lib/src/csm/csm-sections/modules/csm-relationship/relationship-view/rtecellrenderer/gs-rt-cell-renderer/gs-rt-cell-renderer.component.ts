import {Component} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {isString, has} from 'lodash';
// import {ICellRendererAngularComp} from 'ag-grid-angular';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { hasNullAsValue } from '@gs/cs360-lib/src/core-references';

@Component({
  selector: 'gs-gs-rt-cell-renderer',
  templateUrl: './gs-rt-cell-renderer.component.html',
  styleUrls: ['./gs-rt-cell-renderer.component.scss']
})
export class RTCellRendererComponent implements ICellRendererAngularComp {

  public params: any;

  public isNull: boolean;

  public sanitizeText: SafeHtml;

  constructor(private domSanitizer: DomSanitizer) {}

  agInit(params: any): void {
    this.params = params;
    let value;

    if(has(params.value, 'fv')){
      value = params.value.fv;
    }else if(isString(params.value)){
      value = params.value;
    }
    this.isNull = hasNullAsValue(params);
    if(this.isNull) {
      this.sanitizeText = this.params.valueFormatted ? this.params.valueFormatted: '';
    } else {
      this.sanitizeText = !!this.params.valueFormatted
                          ? this.domSanitizer.bypassSecurityTrustHtml(this.params.valueFormatted)
                          : (!!value ? this.domSanitizer.bypassSecurityTrustHtml(value): '');
    }
  }

  refresh(params: any): boolean {
    return false;
  }

}
