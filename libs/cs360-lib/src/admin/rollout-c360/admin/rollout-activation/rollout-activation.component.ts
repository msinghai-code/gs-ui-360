import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import { StateAction } from '@gs/gdk/core';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-rollout-activation',
  templateUrl: './rollout-activation.component.html',
  styleUrls: ['./rollout-activation.component.scss']
})
export class RolloutActivationComponent implements OnInit {

  @Input() isBothText:boolean = false;
  @Input() isSingleText:boolean = false;

  @Output() action = new EventEmitter<StateAction>();

  public modes = [];
  public isR360Enabled: boolean;

  constructor(@Inject("envService") public env: EnvironmentService, private i18nService: NzI18nService) { }

  ngOnInit() {
    const GS = this.env.gsObject;
    this.isR360Enabled = GS.isRelationshipEnabled;
    const paramValue = this.isR360Enabled ? this.i18nService.translate('360.admin.rollout_activation.c/r360'): this.i18nService.translate('360.admin.rollout_activation.c360');
    this.modes = [
      {
        id: 'PUBLISH',
        icon: 'save',
        title: this.i18nService.translate('360.admin.rollout_activation.publishTitle'),
        subTitle: this.i18nService.translate('360.admin.rollout_activation.publishSubTitle'),
        selected: true
      },
      {
          //this.isR360Enabled ? {'C/R360'}: {'C360'}
        id: 'DISCARD',
        icon: 'schedule-run',
        title: this.i18nService.translate('360.admin.rollout_activation.discardTitle'),
        subTitle: this.i18nService.translate('360.admin.rollout_activation.discardSubTitle') +' '+ paramValue ,
        selected: false
      }
    ]
  }

  onClick(mode: any) {
    this.modes.forEach(m => {
      if(m.id === mode.id) {
        m.selected = true;
      } else {
        m.selected = false;
      }
    });
    this.action.emit({
      type: 'ACTIVATION_MODE',
      payload: mode.id
    });
  }

}
