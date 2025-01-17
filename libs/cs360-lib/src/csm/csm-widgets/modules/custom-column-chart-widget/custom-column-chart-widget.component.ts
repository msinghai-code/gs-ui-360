import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CsmWidgetBaseComponent } from '../csm-widget-base/csm-widget-base.component';
import { map, debounce } from 'lodash';
import { CustomColumnChartOptions } from './custom-column-chart-widget.interface';

@Component({
  selector: 'gs-custom-column-chart-widget',
  templateUrl: './custom-column-chart-widget.component.html',
  styleUrls: ['./custom-column-chart-widget.component.scss']
})
export class CustomColumnChartWidgetComponent extends CsmWidgetBaseComponent implements OnInit {

  data: CustomColumnChartOptions;
  showScrollButtons = false;
  @ViewChild('summaryWidgetWrapper', { static: false }) summaryWidgetWrapper: ElementRef;
  chartWrapperElement: HTMLElement;
  colContainerHeight;
  _colContainerHeightDiff;
  hideLeftButton = false;
  hideRightButton = false;

  get colContainerHeightDiff() {
    return this._colContainerHeightDiff;
  }

  set colContainerHeightDiff(value: number) {
    this._colContainerHeightDiff = value;
    this.colContainerHeight = this.sanitizer.bypassSecurityTrustStyle(`calc(100% - ${value}px)`);
  }

  constructor(public csmSummaryService: CsmSummaryService, @Inject(CONTEXT_INFO) public ctx, private sanitizer: DomSanitizer) {
    super(csmSummaryService, ctx);
  }

  ngOnInit() {
    super.ngOnInit();
    this.colContainerHeightDiff = 30;
  }

  dataLoaded() {
    if(this.data) {
      setTimeout(() => {
        this.chartWrapperElement = (this.summaryWidgetWrapper.nativeElement as HTMLElement).querySelector('.chart-wrapper');
        this.calculateShowScrollButtons();
        this.calculateColumnsContainerHeightDiff();
        this.updateArrowStatus();

        this.chartWrapperElement.addEventListener('scroll', () => {
          this.updateArrowStatus();
        });
      })
    }
  }

  onWindowResize() {
    this.calculateShowScrollButtons();
    this.updateArrowStatus();
  }

  calculateShowScrollButtons() {
    this.showScrollButtons = this.chartWrapperElement.scrollWidth > this.chartWrapperElement.clientWidth;
  }

  calculateColumnsContainerHeightDiff() {
    const labelLengths = map(this.data.data, item => item[this.data.labelProp].length);
      const result = this.data.data;
      result.sort((a, b) => b.openCtaCount - a.openCtaCount) 
      result.sort((p,q)=>q.openObjectivesCount-p.openObjectivesCount);
      const longestLabel = Math.max(...labelLengths);
      const index = labelLengths.findIndex(item => item === longestLabel);
   
    const maxLengthLabelEle = (this.summaryWidgetWrapper.nativeElement as HTMLElement).querySelector(`.column-group-wrapper:nth-child(${index + 1}) .label`);

    if(maxLengthLabelEle) {
      const height = Math.min(maxLengthLabelEle.getBoundingClientRect().height, 80);
      if(height > 30) {
        this.colContainerHeightDiff = height;
      }
    }
  }

  scrollChart(event: MouseEvent, value) {
    this.chartWrapperElement.scrollBy({
      left: value,
      behavior: 'smooth'
    });

    event.stopPropagation();
  }

  updateArrowStatus = debounce(() => {
    console.log('scroll end')
    this.hideLeftButton = this.chartWrapperElement.scrollLeft === 0;
    this.hideRightButton = (this.chartWrapperElement.scrollLeft + this.chartWrapperElement.clientWidth) >= this.chartWrapperElement.scrollWidth;
  }, 50)
}