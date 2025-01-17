import { Component, ComponentFactoryResolver, EventEmitter, Input } from '@angular/core';
import { NzModalService } from '@gs/ng-horizon/modal';
import { Observable } from 'rxjs';
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-delete-confirmation',
  template: `
    <div class="gs-delete-dailog__body">
      <p>{{'360.company.admin.delete_operation_title1' | transloco}} {{inputData?.numRows}} {{'360.company.admin.delete_operation_title2' | transloco}}</p>
      <div class="gs-delete-dailog__body-content">
        <ul>
            <!--  to do - iterate a loop and nzCheckedChange keys -->
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company.admin.delete_operation1' | transloco}}</label></li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company.admin.delete_operation2' | transloco}}</label></li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company.admin.delete_operation3' | transloco}}</label></li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company.admin.delete_operation4' | transloco}}</label></li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company.admin.delete_operation5' | transloco}}</label></li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company.admin.delete_operation6' | transloco}}</label></li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company.admin.delete_operation7' | transloco}}</label></li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company.admin.delete_operation8' | transloco}}</label></li>
        </ul>
      </div>
      <p *ngIf="inputData?.objectGraphUrl">{{'360.company.admin.delete_operation_endnote' | transloco}} <a href={{inputData?.objectGraphUrl}} target="_blank"  class="gs-link">{{'360.company.admin.delete_operation_endnote1' | transloco}}</a></p>

      <p>{{'360.company.admin.delete_operation_endnote2' | transloco}}<br>
      <span class="gs-delete-warn">{{'360.company.admin.delete_operation_endnote3' | transloco}}</span></p>
    </div>
  `,
  styleUrls: ['./delete-confirmation.component.scss']
})
export class DeleteConfirmationComponent {

  // this is used to notify the dialog host about the action changes , title changes
  notifier?: EventEmitter<any> = new EventEmitter();
  actions?: any[] = [
    { label: this.i18nService.translate('360.company.admin.delete_operation_permanent_delete'), value: 'YES', disabled: true },
    { label: this.i18nService.translate('360.company.admin.delete_operation_dont_delete'), value: 'NO' },
  ];
  checkedBoxes = 0;
  @Input() inputData;

  constructor(
    private _cfr: ComponentFactoryResolver,
    private modal: NzModalService,
    private i18nService : NzI18nService
  ) {}

  onAgree(event: any) {
    const YESOption = this.actions.find(action => action.value === "YES");
    if(event) {
      this.checkedBoxes++;
      if(this.checkedBoxes === 8) {
        YESOption.disabled = false;
      }
    } else {
      this.checkedBoxes--;
      YESOption.disabled = true;
    }
  }
}
