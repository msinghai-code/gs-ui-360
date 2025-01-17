import { Component, Inject, Input, OnInit ,ElementRef, EventEmitter, } from '@angular/core';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CsmWidgetBaseComponent } from '../csm-widget-base/csm-widget-base.component';

@Component({
  selector: 'gs-default-three-level-widget-csm',
  templateUrl: './default-three-level-widget-csm.component.html',
  styleUrls: ['./default-three-level-widget-csm.component.scss']
})
export class DefaultThreeLevelWidgetCsmComponent extends CsmWidgetBaseComponent implements OnInit {
  isTooltipVisible = false; 
  constructor(csmSummaryService: CsmSummaryService, @Inject(CONTEXT_INFO) public ctx) {
    super(csmSummaryService, ctx);
  }
  tooltipVisible(evt){
    this.isTooltipVisible = evt;
  
}     
}
