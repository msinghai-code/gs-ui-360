import {Component, Inject, OnInit} from '@angular/core';
import {CsmWidgetBaseComponent} from "../csm-widget-base/csm-widget-base.component";
import {CsmSummaryService} from "../../../csm-sections/modules/csm-summary/csm-summary.service";
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-leads-widget',
  templateUrl: './leads-widget.component.html',
  styleUrls: ['./leads-widget.component.scss']
})

export class LeadsWidgetComponent extends CsmWidgetBaseComponent implements OnInit {
  leadsCount: number | string = '--';
  constructor(
      private i18nService: NzI18nService,
      public csmSummaryService: CsmSummaryService,
      @Inject(CONTEXT_INFO) public ctx) {
    super(csmSummaryService, ctx);
  }

  dataLoaded() {
    if (this.data && this.data.hasOwnProperty("recordsCount")) {
      this.leadsCount = this.data.recordsCount;
    }
  }



}
