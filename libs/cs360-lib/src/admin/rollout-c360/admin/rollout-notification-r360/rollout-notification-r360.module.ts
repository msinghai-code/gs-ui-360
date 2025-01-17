import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzStepsModule } from '@gs/ng-horizon/steps';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { RolloutNotificationR360Component } from "./rollout-notification-r360.component";
import { RolloutActivationModule } from "../rollout-activation/rollout-activation.module";
import { RolloutExplorerModule } from "../rollout-explorer/rollout-explorer.module";
import {NzSwitchModule} from "@gs/ng-horizon/switch";
import {FormsModule} from "@angular/forms";
import {NzI18nModule} from "@gs/ng-horizon/i18n";

@NgModule({
  declarations: [RolloutNotificationR360Component],
  imports: [
    CommonModule,
    NzTypographyModule,
    NzButtonModule,
    NzModalModule,
    NzStepsModule,
    NzToolTipModule,
    NzSwitchModule,
    FormsModule,
    RolloutActivationModule,
    RolloutExplorerModule,
    NzI18nModule
  ],
  exports: [RolloutNotificationR360Component]
})
export class RolloutNotificationR360Module { }
