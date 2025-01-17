import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from "@angular/router";
import { RolloutC360Component } from "./rollout-c360.component";
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzSpinModule } from '@gs/ng-horizon/spin';

import { FeatureExplorerComponent } from "./admin/rollout-explorer/feature-explorer/feature-explorer.component";
import { RolloutC360Service } from "./rollout-c360.service";
import { RolloutExplorerComponent } from "./admin/rollout-explorer/rollout-explorer.component";
import { RolloutMigrateComponent } from "./admin/rollout-migrate/rollout-migrate.component";
import { RolloutExplorerModule } from "./admin/rollout-explorer/rollout-explorer.module";
import {NzI18nModule} from "@gs/ng-horizon/i18n";

const routes: Routes = [
    {
      path: '',
      component: RolloutC360Component,
      children: [
        { path: '', redirectTo: 'explore', pathMatch: 'full' },
        { path: 'explore', component: RolloutExplorerComponent },
        { path: 'migrate', component: RolloutMigrateComponent },
      ]
    }
]

@NgModule({
  declarations: [
    RolloutC360Component,
    RolloutMigrateComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    RolloutExplorerModule,
    NzI18nModule
  ],
  exports: [RolloutC360Component],
  providers: [RolloutC360Service]
})
export class RolloutC360Module { 
  constructor() {}
}
