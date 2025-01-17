import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SpinnerModule } from '@gs/gdk/spinner';
import { FlexLayoutModule } from '@angular/flex-layout';

import {SectionUpsertComponent} from "./section-upsert.component";
import {SectionDetailsComponent} from "./section-details/section-details.component";
import {CanDeactivateGlobalSectionStep, SectionUpsertService, SharedRouteOutletService} from "./section-upsert.service";
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzStepsModule } from '@gs/ng-horizon/steps';
import { NzTabsModule } from '@gs/ng-horizon/tabs';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { GlobalSectionConfigurationComponent } from '../section-configuration/global-section-configuration/global-section-configuration.component';
import { GlobalSectionConfigurationModule } from '../section-configuration/global-section-configuration/global-section-configuration.module';
import { GlobalSectionResolverService } from '../section-configuration/global-section-configuration/global-section-configuration.service';

const routes: Routes = [
  {
    path: ':sectionId', component: SectionUpsertComponent,
    children: [
      {
        path: 'details',
        component: SectionDetailsComponent,
        canDeactivate: [CanDeactivateGlobalSectionStep],
      },
      {
        path: 'configure',
        component: GlobalSectionConfigurationComponent,
        resolve: { section: GlobalSectionResolverService }, canDeactivate: [CanDeactivateGlobalSectionStep]
      }
    ]
  }
];

// @dynamic
@NgModule({
  declarations: [
    SectionUpsertComponent,
    SectionDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerModule,
    RouterModule.forChild(routes),
    NzModalModule,
    NzTabsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzStepsModule,
    NzFormModule,
    FlexLayoutModule,
    NzI18nModule,
    GlobalSectionConfigurationModule
  ],
    providers: [SectionUpsertService, SharedRouteOutletService, CanDeactivateGlobalSectionStep]
})
export class SectionUpsertModule { }
