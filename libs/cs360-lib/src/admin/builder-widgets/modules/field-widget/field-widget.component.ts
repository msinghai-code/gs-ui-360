import { Component, OnInit } from '@angular/core';
import { SummaryWidget } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-field-widget',
  templateUrl: './field-widget.component.html',
  styleUrls: ['./field-widget.component.scss']
})
export class FieldWidgetComponent implements OnInit {

  widgetItem: SummaryWidget;
  skeletonArray = [];
  constructor() { }

  ngOnInit() {
    for (let i = 0; i < (this.widgetItem && this.widgetItem.dimensionDetails && this.widgetItem.dimensionDetails.rows || 1); i++) {
      this.skeletonArray.push({});
    }
  }

}
