import {ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Output,} from '@angular/core';
import {ISummaryAttribute} from "./ISummaryInterface";
import {CONTEXT_INFO, ICONTEXT_INFO} from "../../../context.token";
@Component({
  selector: 'gs-summary-attribute',
  templateUrl: './summary-attribute.component.html',
  styleUrls: ['./summary-attribute.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryAttributeComponent implements OnInit{
  @Input() attributeConfig: ISummaryAttribute;
  @Output() changes : EventEmitter<any> = new EventEmitter<any>();
  public isMini360: boolean = false;
  public pieChart: boolean = false;
  public barChart: boolean = false;
  isCtxEmpty;

  constructor(@Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) { }
  ngOnInit() {
    // we don't need flex in admin page, due to which extra space for NPs is coming, flex will only be needed in csm pages
    this.isCtxEmpty = this.ctx && Object.keys(this.ctx).length === 0;

    if(this.attributeConfig.data){
      this.pieChart  = this.attributeConfig.data.id === 'CX_NPS_SUMMARY' || this.attributeConfig.data.id === 'CX_CSAT_SUMMARY' ? true : false;
      if(this.attributeConfig.data.name === "Distribution by Health" && this.attributeConfig.data.visualization && this.attributeConfig.data.visualization.type === "" || null) {
        this.attributeConfig.data.message = "No Health Scores";
      }
      if(this.attributeConfig.data.message && this.attributeConfig.data.name !== "Distribution by Health"){
        this.pieChart = !this.pieChart;
      } 
    }
  }
}
