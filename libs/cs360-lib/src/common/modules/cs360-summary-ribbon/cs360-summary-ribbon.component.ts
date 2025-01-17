import {Component, Input, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'gs-cs360-summary-ribbon',
  templateUrl: './cs360-summary-ribbon.component.html',
  styleUrls: ['./cs360-summary-ribbon.component.scss']
})
export class Cs360SummaryRibbonComponent implements OnInit {

  @Input() metrics: any[];

  @Input() options: { maxLimit: number } = { maxLimit: 6 };

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.metrics.firstChange) return;
    if(!!changes.metrics.currentValue) {
      console.log(this.metrics);
    }
  }

  attributeEventHandler(evt: any) {}

}
