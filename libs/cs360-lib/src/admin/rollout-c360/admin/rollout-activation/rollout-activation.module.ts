import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { RolloutActivationComponent } from "./rollout-activation.component";
import {NzI18nModule} from "@gs/ng-horizon/i18n";

@NgModule({
  declarations: [RolloutActivationComponent],
  imports: [
    CommonModule,
    NzTypographyModule,
    NzIconModule,
    NzI18nModule
  ],
  exports: [RolloutActivationComponent]
})
export class RolloutActivationModule { }
