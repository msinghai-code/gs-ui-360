import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRolloutC360Component } from "./admin.component";
import { RolloutNotificationModule } from "./rollout-notification/rollout-notification.module";
import { RolloutNotificationR360Module } from "./rollout-notification-r360/rollout-notification-r360.module";

@NgModule({
  declarations: [AdminRolloutC360Component],
  imports: [
    CommonModule,
    RolloutNotificationModule,
    RolloutNotificationR360Module
  ],
  exports: [AdminRolloutC360Component]
})
export class AdminRolloutC360Module { }
