import { Component, Inject, OnInit } from '@angular/core';
import { EventType, WidgetEvent } from '@gs/cs360-lib/src/common';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { isEmpty } from 'lodash';

@Component({
  selector: 'gs-csm-widget-base',
  template: ''
})
export class CsmWidgetBaseComponent implements OnInit {

  widgetItem: any;
  isLoading: boolean = true;
  data: any;
  entityId: string;
  isReadOnly: boolean = false;
  isSaveInProgress: boolean = false;
  editMode: boolean = false;
  isEditable: boolean = false;
  constructor(public csmSummaryService: CsmSummaryService, @Inject(CONTEXT_INFO) public ctx) {
    this.isReadOnly = this.csmSummaryService.isReadOnly();
  }

  ngOnInit() {
    this.getData();
  }

  protected getData() {
    this.csmSummaryService.getData(this.widgetItem.widgetType).subscribe((data) => {
      if (!isEmpty(data)) {
        this.data = data[this.widgetItem.itemId];
        this.isSaveInProgress = false;
        this.isLoading = false;
      }
      this.editMode = false;
      // check if widgetItem.editable is present or not, if not then add it and set it to false
        if (!this.widgetItem.editable) {
            this.widgetItem.editable = false;
        }
      delete this.widgetItem.isSaving;
      delete this.widgetItem.updatedLabel;
      delete this.widgetItem.isEdit;

      this.dataLoaded();
    });
  }

  /**
   * To be implemented by sub classes
   */
  dataLoaded() { }
}
