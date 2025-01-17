
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SummaryConfigurationModule } from './modules/summary-configuration/summary-configuration.module';
import { AttributeConfigurationModule } from './modules/attribute-configuration/attribute-configuration.module';
import { AdminSectionRendererComponent } from './admin-section-renderer/admin-section-renderer.component';
import { BaseSectionModule } from '@gs/cs360-lib/src/common';
import { RelationshipConfigurationModule } from './modules/relationship-configuration/relationship-configuration.module';
import { CompanyHierarchyConfigurationModule } from './modules/company-hierarchy-configuration/company-hierarchy-configuration.module';
import { EmbedPageConfigurationModule } from './modules/embed-page-configuration/embed-page-configuration.module';
import { UsageConfigurationModule } from './modules/usage-configuration/usage-configuration.module';
import { PeopleConfigurationModule } from "./modules/people-configuration/people-configuration.module";
import { ReportsConfigWrapperModule } from "./modules/reports-configuration/report-config-wrapper.module";
import { BaseAdminSectionRendererModule } from "./base-admin-section-renderer/base-admin-section-renderer.module";
import {LAZY_WIDGETS, LazyLoaderService} from "@gs/gdk/services/lazy";
// import {lazyWidgets} from "@gs/cs360-lib/src/csm";

@NgModule({
  declarations: [
    AdminSectionRendererComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BaseSectionModule,
    ReactiveFormsModule,
    SummaryConfigurationModule,
    AttributeConfigurationModule,
    ReportsConfigWrapperModule,
    RelationshipConfigurationModule,
    CompanyHierarchyConfigurationModule,
    EmbedPageConfigurationModule,
    UsageConfigurationModule,
    PeopleConfigurationModule,
    BaseAdminSectionRendererModule
  ],
  providers: [
    //  LazyLoaderService,
    //  {provide: LAZY_WIDGETS, useValue: lazyWidgets}
  ],
  exports: [AdminSectionRendererComponent],
  entryComponents: [AdminSectionRendererComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminSectionModule { }
