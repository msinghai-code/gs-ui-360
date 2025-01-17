import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';

@Component({
  selector: 'gs-record-type-selection-modal',
  template: `
    <nz-select 
      [(ngModel)]="selectedRecordType" 
      nzPlaceHolder="Please select record type" 
      style="width: 60%;"
      >
      <nz-option *ngFor="let recordTypeId of recordTypeIds" [nzValue]="recordTypeId.value" [nzLabel]="recordTypeId.label" [nzDisabled]="!recordTypeId.active"></nz-option>
    </nz-select>
  `,
})
export class RecordTypeSelectionModalComponent implements OnInit{

  @Input() recordTypeIds = [];

  selectedRecordType = null;

  constructor() { }

  ngOnInit() {
    const defaultItem = this.recordTypeIds.find(recordTypeId => recordTypeId.defaultValue);
    // If there is a default item then use that. Otherwise use the first item
    if(defaultItem && defaultItem.value) {
      this.selectedRecordType = defaultItem.value;
    } else {
      this.selectedRecordType = this.recordTypeIds[0] && this.recordTypeIds[0].value || null;
    }
    
  }

}
