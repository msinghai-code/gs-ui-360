import { Component, OnInit } from '@angular/core';
import { SummaryWidget } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-text-widget',
  templateUrl: './text-widget.component.html',
  styleUrls: ['./text-widget.component.scss']
})
export class TextWidgetComponent implements OnInit {

  skeletonArray = [];
  widgetItem: SummaryWidget;

  ngOnInit() {
    for (let i = 0; i < ((this.widgetItem && (this.widgetItem['rows']/2)) || (this.widgetItem.dimensionDetails && (this.widgetItem.dimensionDetails.rows/2)) || 1); i++) {
      this.skeletonArray.push({});
    }
  }

}
