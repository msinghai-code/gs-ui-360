import { Component, Inject, OnInit } from '@angular/core';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CsmWidgetBaseComponent } from '../csm-widget-base/csm-widget-base.component';

@Component({
  selector: 'gs-basic-insights-widget',
  templateUrl: './basic-insights-widget.component.html',
  styleUrls: ['./basic-insights-widget.component.scss']
})
export class BasicInsightsWidgetComponent extends CsmWidgetBaseComponent implements OnInit {

  constructor(public csmSummaryService: CsmSummaryService, @Inject(CONTEXT_INFO) public ctx) { 
    super(csmSummaryService, ctx);
  }
}
