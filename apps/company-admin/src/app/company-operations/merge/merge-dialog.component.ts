import { Component, ComponentFactoryResolver, EventEmitter, Input } from '@angular/core';
import { NzModalService } from '@gs/ng-horizon/modal';
import { Observable } from 'rxjs';
import { NzI18nService } from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-merge-dialogs',
  template: `
    <div class="gs-merge-dailog__body">
      <p>{{'360.company-admin.merge_comp.subtitle' | transloco}}</p>
      <div class="gs-merge-dailog__body-content">
        <ul>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company-admin.merge_comp.condition1' | transloco}}</label></li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company-admin.merge_comp.condition2' | transloco}}</label></li>
          <li>
            <label nz-checkbox (nzCheckedChange)="onAgree($event)">
            {{'360.company-admin.merge_comp.condition3' | transloco}}  <br/>
            {{'360.company-admin.merge_comp.condition3_continue' | transloco}}  <a href={{scorecardURL}} target="_blank"  class="gs-link">{{'360.company-admin.merge_comp.condition3_end' | transloco}}</a>.
            </label>
          </li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company-admin.merge_comp.condition4' | transloco}}</label></li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)"> {{'360.company-admin.merge_comp.condition5' | transloco}}</label></li>
          <li><label nz-checkbox (nzCheckedChange)="onAgree($event)">{{'360.company-admin.merge_comp.condition6' | transloco}}</label></li>
        </ul>
      </div>
      <p *ngIf="inputData?.documentationUrl"> {{'360.company-admin.merge_comp.condition7' | transloco}} <a href={{inputData?.documentationUrl}} target="_blank"  class="gs-link">document</a> {{'360.company-admin.merge_comp.condition7_continue' | transloco}}</p>

      <span class="gs-merge-warn">{{'360.company-admin.merge_comp.condition8' | transloco}}</span>

    </div>
  `,
  styleUrls: ['./merge-dialog.component.scss']
})
export class MergeDialogComponent {

  notifier?: EventEmitter<any> = new EventEmitter();
  checkedBoxes = 0;
  actions?: any[] = [
    { label:  this.i18nService.translate('360.company-admin.merge_comp.Confirm'), value: 'YES', class:"mat-raised-button mat-primary gs-px-company-merge", disabled: true },
    { label:  this.i18nService.translate('360.company-admin.merge_comp.Cancel'), value: 'NO' }
  ];

  @Input() inputData;
  scorecardURL = `https://support.gainsight.com/SFDC_Edition/Scorecards/02Scorecards_2.0/02Admin_Guides/Create_Scorecards_2.0#Scorecard_Resolver`;

  constructor(
    private _cfr: ComponentFactoryResolver,
    private modalService: NzModalService,
    private i18nService: NzI18nService
  ) {

  }

  onAgree(event: any) {
    const YESOption = this.actions.find(action => action.value === "YES");
    if(event) {
      this.checkedBoxes++;
      if(this.checkedBoxes === 6) {
        YESOption.disabled = false;
      }
    } else {
      this.checkedBoxes--;
      YESOption.disabled = true;
    }
  }

}
