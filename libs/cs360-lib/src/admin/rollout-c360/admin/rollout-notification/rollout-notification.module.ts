import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { RolloutNotificationComponent } from "./rollout-notification.component";
import { RolloutActivationModule } from "../rollout-activation/rollout-activation.module";
import { RolloutExplorerModule } from "../rollout-explorer/rollout-explorer.module";
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import { NzStepsModule } from '@gs/ng-horizon/steps';
import {NzSwitchModule} from "@gs/ng-horizon/switch";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [RolloutNotificationComponent],
  imports: [
    NzSwitchModule,
    CommonModule,
    NzTypographyModule,
    NzButtonModule,
    NzModalModule,
    NzToolTipModule,
    RolloutActivationModule,
    RolloutExplorerModule,
    NzI18nModule,
    NzStepsModule,
    FormsModule
    
  ],
  exports: [RolloutNotificationComponent]
})
export class RolloutNotificationModule { }
