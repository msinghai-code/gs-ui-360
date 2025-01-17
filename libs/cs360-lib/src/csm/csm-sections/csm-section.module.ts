import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSkeletonModule } from "@gs/ng-horizon/skeleton";
import { CsmSectionRendererComponent } from './csm-section-renderer/csm-section-renderer.component';
import { BaseCsmSectionRendererModule } from "./base-csm-section-renderer/base-csm-section-renderer.module";
import { BaseSectionModule } from '@gs/cs360-lib/src/common';
import { EmptyModule } from './modules/empty/empty.module';
import { CsmSummaryComponent } from '../csm-sections/modules/csm-summary/csm-summary.component';
import { CsmSummaryModule } from '../csm-sections/modules/csm-summary/csm-summary.module';
import {CsmReportsModule} from "./modules/csm-reports/csm-reports.module";
// import { LAZY_WIDGETS, LazyLoaderService } from "@gs/gdk/services/lazy";
// import { lazyWidgets } from "./services/LazyLoadEntry";
@NgModule({
  declarations: [
    CsmSectionRendererComponent
  ],
  imports: [
    CommonModule,
    BaseSectionModule,
    NzSkeletonModule,
    BaseCsmSectionRendererModule,
    EmptyModule,
    CsmSummaryModule,
    CsmReportsModule
  ],
  exports: [
    CsmSectionRendererComponent
  ],
  entryComponents: [
    CsmSectionRendererComponent
  ],
  providers: [
    // LazyLoaderService,
    // {provide: LAZY_WIDGETS, useValue: lazyWidgets}
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CSMSectionModule { }
