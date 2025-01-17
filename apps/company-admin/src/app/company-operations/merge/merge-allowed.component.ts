import { Component, ComponentFactoryResolver, EventEmitter, Input } from '@angular/core';
import { NzModalService } from '@gs/ng-horizon/modal';
import { Observable } from 'rxjs';

@Component({
  selector: 'gs-merge-dialogs',
  template: `
    <div>
      <div>You cannot merge companies with currency values in different currency codes.</div>
      <div>Please go to {{inputData.path}} to update the currency code before merging.</div>
    </div>
  `,
  styles: []
})
export class MergeAllowedDialogComponent {

  saving = false;

  notifier?: EventEmitter<any> = new EventEmitter();
  actions = [
    { label: 'OK', value: 'ok' }
  ];

  @Input() inputData;

  constructor(
    private _cfr: ComponentFactoryResolver,
    private modalService: NzModalService
  ) {

  }
}
