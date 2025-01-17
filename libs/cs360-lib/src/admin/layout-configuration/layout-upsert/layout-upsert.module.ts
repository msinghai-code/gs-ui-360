import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ObjectFilterQueryModule } from '@gs/gdk/filter/builder';
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { SpinnerModule } from '@gs/gdk/spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutUpsertResolverService, CanDeactivateLayoutStep } from './layout-upsert-resolver.service';
import { LayoutUpsertComponent } from './layout-upsert.component';
import { GridsterModule } from 'angular-gridster2';
import { LayoutSectionsConfigureComponent } from './layout-sections-configure/layout-sections-configure.component';
import { LayoutDetailsComponent } from './layout-details/layout-details.component';
import { LayoutAssignComponent } from './layout-assign/layout-assign.component';
// import { SectionListingModule, SharedPipesModule } from '@gs/cs360-lib';
import { SectionListingModule } from '../../admin-sections/modules/shared/section-listing/section-listing.module';
import { SharedPipesModule } from '@gs/cs360-lib/src/common';
import { FlexLayoutModule } from '@angular/flex-layout';
// import { MatNativeDateModule } from '@angular/material';
import { NzTagModule } from '@gs/ng-horizon/tag';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzCollapseModule } from '@gs/ng-horizon/collapse';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzStepsModule } from '@gs/ng-horizon/steps';
import { NzTabsModule } from '@gs/ng-horizon/tabs';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { AddAssociationModule } from '../layout-listing/configurations/object-associations/add-association/add-association.module';
import { SharedRouteOutletService } from "./layout-upsert.service";
import { DescribeModule } from '@gs/gdk/services/describe';
import { GlobalFilterStripModule } from '@gs/gdk/filter/global';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { LayoutAssignModule } from './layout-assign/layout-assign.module';
import { LayoutDetailsModule } from './layout-details/layout-details.module';
import { LayoutSectionsConfigureModule } from './layout-sections-configure/layout-sections-configure.module';
import { LayoutPreviewModule } from '../layout-preview/layout-preview.module';

const routes: Routes = [
  {
    path: ':layoutId', component: LayoutUpsertComponent, 
    resolve: { details: LayoutUpsertResolverService },
    children: [
      {
        path: 'details', 
        component: LayoutDetailsComponent,
        resolve: { details: LayoutUpsertResolverService },
        canDeactivate: [CanDeactivateLayoutStep]
      }, {
        path: 'assign',
        component: LayoutAssignComponent,
        resolve: { meta: LayoutUpsertResolverService },
        canDeactivate: [CanDeactivateLayoutStep]
      }, {
        path: 'configure',
        component: LayoutSectionsConfigureComponent,
        resolve: { meta: LayoutUpsertResolverService },
        canDeactivate: [CanDeactivateLayoutStep]
      }]
  }
];

@NgModule({
  declarations: [
    LayoutUpsertComponent
  ],
  imports: [
    CommonModule,
    GridsterModule,
    SpinnerModule,
    RouterModule.forChild(routes),
    NzInputModule,
    FlexLayoutModule,
    NzStepsModule,
    NzFormModule,
    NzSelectModule,
    FormsModule,
    NzModalModule,
    DocumentEventModule,
    NzTabsModule,
    NzTagModule,
    NzEmptyModule,
    ReactiveFormsModule,
    NzIconModule,
    NzButtonModule,
    NzTypographyModule,
    DragDropModule,
    NzCollapseModule,
    NzPopoverModule,
    NzToolTipModule,
    SectionListingModule,
    AddAssociationModule,
    SharedPipesModule,
    ObjectFilterQueryModule,
    DescribeModule,
    GlobalFilterStripModule,
    NzI18nModule,
    LayoutAssignModule,
    LayoutDetailsModule,
    LayoutSectionsConfigureModule,
    LayoutPreviewModule,
  ],
  exports: [],
  providers: [
    LayoutUpsertResolverService,
    CanDeactivateLayoutStep,
    SharedRouteOutletService,
  ]
})
export class LayoutUpsertModule {
}
