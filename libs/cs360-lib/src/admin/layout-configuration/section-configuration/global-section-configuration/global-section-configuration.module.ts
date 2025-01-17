import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SectionResolverService } from './../section-configuration.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { AdminSectionModule } from '../../../admin-sections/admin-section.module';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzTagModule } from '@gs/ng-horizon/tag';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { GlobalSectionConfigurationComponent } from "./global-section-configuration.component";
import { GlobalSectionResolverService } from "./global-section-configuration.service";
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzDividerModule } from '@gs/ng-horizon/divider';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzSwitchModule } from '@gs/ng-horizon/switch';
import { SummaryPreviewModule } from '../summary-preview/summary-preview.module';
import { CanDeactivateGlobalSectionStep } from '../../../layout-configuration/section-upsert/section-upsert.service';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
const routes: Routes = [
  { path: '', component: GlobalSectionConfigurationComponent, resolve: { section: GlobalSectionResolverService }, canDeactivate: [CanDeactivateGlobalSectionStep] }
];
@NgModule({
  declarations: [GlobalSectionConfigurationComponent],
  imports: [
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
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
    NzI18nModule
  ],
  providers: [SectionResolverService, GlobalSectionResolverService, CanDeactivateGlobalSectionStep]
})
export class GlobalSectionConfigurationModule { }
