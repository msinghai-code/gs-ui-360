import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutConfigurationComponent } from './layout-configuration.component';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { RouterModule, Routes } from '@angular/router';

import { LayoutListingModule } from "@gs/cs360-lib/src/admin/layout-configuration/layout-listing/layout-listing.module";
import { LayoutNotFoundModule } from "@gs/cs360-lib/src/admin/layout-configuration/layout-not-found/layout-not-found.module";
import { LayoutNotFoundComponent } from "@gs/cs360-lib/src/admin/layout-configuration/layout-not-found/layout-not-found.component";

const routes: Routes = [
  { path: '', component: LayoutConfigurationComponent},
  { path: 'layout', loadChildren: () => import('@gs/cs360-lib/src/admin/layout-configuration/layout-upsert/layout-upsert.module').then(m => m.LayoutUpsertModule) },
  { path: 'section', loadChildren: () => import('@gs/cs360-lib/src/admin/layout-configuration/section-upsert/section-upsert.module').then(m => m.SectionUpsertModule) },
  { path: 'configure/:layoutId/:sectionId', loadChildren: () => import('@gs/cs360-lib/src/admin/layout-configuration/section-configuration/section-configuration.module').then(m => m.SectionConfigurationModule) },
  { path: 'relationship', loadChildren: () => import('@gs/cs360-lib/src/admin/layout-configuration/relationship-layout-configuration/relationship-layout-configuration.module').then(m => m.RelationshipLayoutConfigurationModule) },
  { path: 'preview/:layoutId/:relTypeId', loadChildren: () => import('@gs/cs360-lib/src/admin/layout-configuration/layout-preview/layout-preview.module').then(m => m.LayoutPreviewModule) },
  { path: 'layout-404', component: LayoutNotFoundComponent },
  { path: 'layout-section-404', component: LayoutNotFoundComponent, data: { layoutOrSection: true } },
];

@NgModule({
  declarations: [
    LayoutConfigurationComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LayoutListingModule,
    NzIconModule,
    LayoutNotFoundModule
  ],
  exports: []
})
export class LayoutConfigurationModule { }
