import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionConfigurationComponent } from './section-configuration.component';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateSectionConfig, SectionResolverService } from './section-configuration.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminSectionModule } from '../../admin-sections/admin-section.module';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzTagModule } from '@gs/ng-horizon/tag';
import { NzModalModule } from '@gs/ng-horizon/modal';
import {SharedRouteOutletService} from "../section-upsert/section-upsert.service";
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzDividerModule } from '@gs/ng-horizon/divider';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzSwitchModule } from '@gs/ng-horizon/switch';
import { SummaryPreviewModule } from './summary-preview/summary-preview.module';
import { SpinnerModule } from '@gs/gdk/spinner';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { NzToolTipModule } from "@gs/ng-horizon/tooltip";


const routes: Routes = [
  { path: '', component: SectionConfigurationComponent, resolve: { section: SectionResolverService }, canDeactivate: [CanDeactivateSectionConfig] }
];
@NgModule({
  declarations: [SectionConfigurationComponent],
  imports: [
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
    SpinnerModule,
    FormsModule,
    NzTagModule,
    CommonModule,
    FlexLayoutModule,
    NzDrawerModule,
    AdminSectionModule,
    RouterModule.forChild(routes),
    NzDividerModule,
    NzSwitchModule,
    NzTypographyModule,
    NzSelectModule,
    SummaryPreviewModule,
    NzFormModule,
    ReactiveFormsModule,
    NzI18nModule,
    NzToolTipModule
 
  ],
  providers: [SectionResolverService, SharedRouteOutletService, CanDeactivateSectionConfig]
})
export class SectionConfigurationModule { }
