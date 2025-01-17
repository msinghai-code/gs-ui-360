import { Component, OnInit } from '@angular/core';
import { SummaryWidget,WidgetItemSubType } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-default-widget',
  templateUrl: './default-widget.component.html',
  styleUrls: ['./default-widget.component.scss']
})
export class DefaultWidgetComponent implements OnInit {

  widgetItem: SummaryWidget;
  widgetItemSubType = WidgetItemSubType;
  skeletonArray = [];
  constructor() { }

  ngOnInit() {
    switch(this.widgetItem.subType){
      case WidgetItemSubType.LIST:
        this.skeletonArray = new Array(this.widgetItem.maxItemRows);
        break;
      default: 
        if(this.widgetItem.dimensionDetails && this.widgetItem.dimensionDetails.rows < 4 ) {
          this.skeletonArray = [{}];
        } else {
          for (let i=0; i < ((this.widgetItem && this.widgetItem.dimensionDetails && (this.widgetItem.dimensionDetails.rows/2)) || 1); i++) {
          this.skeletonArray.push({});
          }
        }
    }
  }

}
