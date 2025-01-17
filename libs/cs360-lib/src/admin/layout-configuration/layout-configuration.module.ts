import { CommonModule } from '@angular/common';
// import { LayoutConfigurationComponent } from './layout-configuration.component';
import { LayoutConfigurationService } from './layout-configuration.service';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { RouterModule, Routes } from '@angular/router';
import { LayoutListingModule } from './layout-listing/layout-listing.module';
import { LayoutNotFoundModule } from './layout-not-found/layout-not-found.module';
import { LayoutNotFoundComponent } from './layout-not-found/layout-not-found.component';
import { LayoutPreviewModule } from './layout-preview/layout-preview.module';
import { DescribeService, DescribeModule } from "@gs/gdk/services/describe";

// const routes: Routes = [
//   { path: '', component: LayoutConfigurationComponent},
//   { path: 'layout', loadChildren: () => import('./layout-upsert/layout-upsert.module').then(m => m.LayoutUpsertModule) },
//   { path: 'section', loadChildren: () => import('./section-upsert/section-upsert.module').then(m => m.SectionUpsertModule) },
//   { path: 'configure/:layoutId/:sectionId', loadChildren: () => import('./section-configuration/section-configuration.module').then(m => m.SectionConfigurationModule) },
//   { path: 'relationship', loadChildren: () => import('./relationship-configuration/relationship-configuration.module').then(m => m.RelationshipConfigurationModule) },
//   { path: 'preview/:layoutId/:relTypeId', loadChildren: () => import('./layout-preview/layout-preview.module').then(m => m.LayoutPreviewModule) },
//   { path: 'layout-404', component: LayoutNotFoundComponent },
//   { path: 'layout-section-404', component: LayoutNotFoundComponent, data: { layoutOrSection: true } },
// ];

// @dynamic
@NgModule({
  declarations: [
    // LayoutConfigurationComponent
  ],
  imports: [
    CommonModule,
    //RouterModule.forChild(routes),
    LayoutListingModule,
    NzIconModule,
    LayoutNotFoundModule,
    DescribeModule,
    LayoutPreviewModule
  ],
  exports: [],
  providers: [
    LayoutConfigurationService,
      DescribeService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LayoutConfigurationModule { }
