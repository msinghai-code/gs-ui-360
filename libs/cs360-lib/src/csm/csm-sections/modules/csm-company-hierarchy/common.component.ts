import { Component, Inject, Input } from '@angular/core';
import { isValidHTMLTagFromString } from "@gs/gdk/utils/common";
import { ALLOWED_HTML_TAG_FOR_STRING_DTS } from "@gs/gdk/grid";
import { NzI18nService } from "@gs/ng-horizon/i18n";
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { plainGray10 } from '@gs/design-tokens/colors';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { IAfterGuiAttachedParams } from "@ag-grid-community/core";

@Component({
  selector: 'app-name-renderer',
  template: `<span *ngIf="data && data.isCurrent && !data.moreLevelsOnTop" class="hierarchy-name hierarchy-current">
  <nz-badge nzDotSize='md' [nzStatus]="statusClass"></nz-badge>
    <span *ngIf="data.isCurrent" class="name">{{ displayName }}</span>
    <a [appLink360]="params" *ngIf="!data.isCurrent" class="name">{{displayName}}</a>
    <nz-tag nzColor='#F6F6F6' nzMode='status' nzSize='xs'>{{ currentText }}</nz-tag>
    </span>

    <span *ngIf="!data.isCurrent && !data.moreLevelsOnTop" class="hierarchy-name">
    <nz-badge nzDotSize='md' [nzStatus]="statusClass"></nz-badge>
      <span *ngIf="data.isCurrent" class="name">{{ displayName }}</span>
      <a [appLink360]="params" *ngIf="!data.isCurrent" class="name">{{displayName}}</a>
    </span>

    <span *ngIf="data.moreLevelsOnTop" class="hierarchy-info">
      <span class="limit-info">{{ topLevels }}</span>
      <span class="hierarchy-name">
      <nz-badge nzDotSize='md' [nzStatus]="statusClass"></nz-badge>
        <span *ngIf="data.isCurrent" class="name">{{ displayName }}</span>
        <a [appLink360]="params" *ngIf="!data.isCurrent" class="name">{{displayName}}</a>
      </span>
    </span>

    <span *ngIf="data.moreLevelsOnBottom" class="hierarchy-info">
    <nz-badge nzDotSize='md' [nzStatus]="statusClass"></nz-badge>
      <span *ngIf="data.isCurrent" class="name">{{ displayName }}</span>
      <a [appLink360]="params" *ngIf="!data.isCurrent" class="name">{{displayName}}</a>
      <span class="limit-info">{{ bottomLevels }}</span>
    </span>`,
})
export class NameRendererComponent implements ICellRendererAngularComp {
  @Input() data: any; // Input data object with properties like name, gsid, isCurrent, etc.
  displayName: string;
  currentText: string;
  topLevels: string;
  bottomLevels: string;
  params: any;
  isMini360: boolean = false;
  statusClass: string;


  constructor(private i18nService: NzI18nService, @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) {}
  refresh(params: any): boolean {
    return false;
  }
  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    throw new Error('Method not implemented.');
  }

  agInit(params: any): void {
    console.log(params);
    this.isMini360 = isMini360(this.ctx);
    this.params = {value: params.value || params.data.gsid, pageContext:"C360"};
    this.data = params.data;
    this.displayName = this.getDisplayName();
    this.currentText = this.i18nService.translate('360.csm.company_hierarchy.current');
    this.topLevels = this.i18nService.translate('360.csm.company_hierarchy.levels_top');
    this.bottomLevels = this.i18nService.translate('360.csm.company_hierarchy.levels_bottom');
    this.statusClass = this.data && this.data.statusClass ? this.data.statusClass.toLowerCase() : '';
    switch(this.statusClass) {
      case 'active':
        this.statusClass = 'success';
        break;
      case 'inactive':
        this.statusClass = 'default';
        break;
      case 'churn': 
      this.statusClass = 'error';
      break;
    }
  }

  getStatusClass(statusClass: string) {
    return statusClass ? statusClass.toLowerCase() : '';
  }

  getDisplayName() {
    let name = this.data.name || '';
    try {
      // Show only innerText for the HTML strings
      const nodesList = isValidHTMLTagFromString(name, ALLOWED_HTML_TAG_FOR_STRING_DTS.join(', '));
      name = nodesList.length ? escape(name) : name;
    } catch (e) {
      // Fallback to pristine formatted value.
    }
    return name;
  }

}
