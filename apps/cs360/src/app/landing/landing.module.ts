/**
 * created by rpal on 2021-02-23
 */

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { NzTabsModule } from '@gs/ng-horizon/tabs';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { FlexLayoutModule } from '@angular/flex-layout';

import {LandingComponent, PXSectionPipe} from './landing.component';
import { HeaderComponent } from './header/header.component';
import { SuccessSnapshotExportComponent } from './success-snapshot-export/success-snapshot-export.component';
import { WithpermissionModule, SharedPipesModule } from "@gs/cs360-lib/src/common";
import {
  CsmCompanyHierarchyModule,
  CsmRelationshipModule,
  CSMSectionModule,
  EmptyModule,
  QuickActionsModule
} from '@gs/cs360-lib/src/csm';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { CS360LandingRouteGuard } from './landing.guard';
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import { MoreTabDropdownModule } from '@gs/cs360-lib/src/csm';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { ManageSectionsModule } from '@gs/cs360-lib/src/csm';
import { NzAffixModule } from '@gs/ng-horizon/affix';
import { NzBadgeModule } from '@gs/ng-horizon/badge';
import {NzDrawerModule} from "@gs/ng-horizon/drawer";
import {NzSelectModule} from "@gs/ng-horizon/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
// import { MatFormFieldModule, MatInputModule } from '@angular/material';
import {NzInputModule} from "@gs/ng-horizon/input";
import {NzFormModule} from "@gs/ng-horizon/form";
import { NotificationSubscriberComponent } from './header/notification-subscriber/notification-subscriber.component';
import { SlideDecksListingComponent } from './slide-decks-listing/slide-decks-listing.component';
import { LazyElementsModule } from '@angular-extensions/elements';
import { DialogComponent } from '../landing/dialog/dialog.component';
import {NzToolTipModule, NzToolTipComponent} from "@gs/ng-horizon/tooltip";
// import {MatIconModule} from "@angular/material/icon";
import { ShareSsDropdownComponent } from './header/share-ss-dropdown/share-ss-dropdown.component';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { SpinnerModule } from '@gs/gdk/spinner';
// import { SharedModule} from "@gs/core";
import { NzTagModule } from '@gs/ng-horizon/tag';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzDividerModule } from '@gs/ng-horizon/divider';
import { NzSwitchModule } from '@gs/ng-horizon/switch';
import {PreviewBannerModule} from "@gs/cs360-lib/src/csm";
import { PXPipe} from "./header/header.service";
import { IntersectionObserverModule } from "@gs/gdk/widget-viewer";
import { EnvironmentModule } from '@gs/gdk/services/environment';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { NotAvilableOnlyMiniComponent } from './not-avilable-only-mini/not-avilable-only-mini.component';

const routes: Routes =
  [
    { path: '', component: LandingComponent, canActivate: [CS360LandingRouteGuard] },
    { path: ':sectionId', component: LandingComponent, canActivate: [CS360LandingRouteGuard] }
  ];

@NgModule({
  declarations: [
    LandingComponent,
    HeaderComponent,
    SuccessSnapshotExportComponent,
    NotificationSubscriberComponent,
    ShareSsDropdownComponent,
    SlideDecksListingComponent,
    DialogComponent,
    PXPipe,
    PXSectionPipe,
    NotAvilableOnlyMiniComponent
  ],
  imports: [
    CsmCompanyHierarchyModule,
    CsmRelationshipModule,
    CommonModule,
    RouterModule.forChild(routes),
    NzTabsModule,
    CSMSectionModule,
    NzButtonModule,
    NzIconModule,
    NzBadgeModule,
    NzTypographyModule,
    NzToolTipModule,
    FlexLayoutModule,
    NzEmptyModule,
    NzDropDownModule,
    SharedPipesModule,
    MoreTabDropdownModule,
    NzTagModule,
    ManageSectionsModule,
    NzModalModule,
    QuickActionsModule,
    NzAffixModule,
    WithpermissionModule,
    NzDrawerModule,
    NzSelectModule,
    FormsModule,
    // MatFormFieldModule,
    // MatInputModule,
    ReactiveFormsModule,
    NzInputModule,
    NzFormModule,
    LazyElementsModule,
    NzToolTipModule,
    // MatIconModule,
    NzSkeletonModule,
    SpinnerModule,
    EmptyModule,
    PreviewBannerModule,
    IntersectionObserverModule,
    NzDividerModule,
    NzSwitchModule,
    EnvironmentModule,
    NzI18nModule
  ],
  exports: [
    RouterModule,
    LandingComponent,
    // SharedModule
  ],
  providers: [
    CS360LandingRouteGuard
    ],
  entryComponents: [NzToolTipComponent, DialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingModule { }
