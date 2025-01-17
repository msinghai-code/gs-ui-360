import { Component, OnInit } from '@angular/core';
import { SummaryWidget } from '@gs/cs360-lib/src/common';
import { SummaryConfigurationService } from '@gs/cs360-lib/src/common';
import { BaseWidgetComponent } from "@gs/gdk/widget-viewer";


@Component({
  selector: 'gs-customer-journey-builder',
  templateUrl: './customer-journey-builder.component.html',
  styleUrls: ['./customer-journey-builder.component.scss']
})
export class CustomerJourneyBuilderComponent extends BaseWidgetComponent implements OnInit {
  widgetItem: SummaryWidget;
  widgetCategories;
  editItem: any;
  config;

  constructor(private summaryConfigrationService: SummaryConfigurationService) {
    super();
  }

  ngOnInit() {
    this.subscribeForResolvedWidgetCategories();
  }

  subscribeForResolvedWidgetCategories() {
    this.summaryConfigrationService.getResolvedwidgetCategories().subscribe(x => {
      this.widgetCategories = x;
    });
  }

  onConfigureClick(){
    this.changes.emit({ payload:this.widgetItem, type: 'CONFIGURE' });
  }

  onDocumentEvent(data) {
    if (this.editItem) {
      if (data.event === 'CLICKED' || data.event === 'ENTER_PRESSED') {
        this.editItem.label = this.editItem.tempLabel || this.editItem.label;
        this.editItem.showLabelInput = false;
        delete this.editItem.tempLabel;
      } else if (data.event === 'ESCAPE_PRESSED') {
        delete this.editItem.tempLabel;
        this.editItem.showLabelInput = false;
      }
    }
  }

  updateConfig($event){
    this.config=$event;
  }


}
