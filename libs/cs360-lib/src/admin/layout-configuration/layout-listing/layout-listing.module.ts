import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
// import { MatListModule } from "@angular/material";
import { Routes, RouterModule } from "@angular/router";
import { GsPipesModule } from "@gs/gdk/pipes";
import { GridModule} from "@gs/gdk/grid";
import { FieldTreeModule } from "@gs/gdk/field-tree";
import { SpinnerModule } from '@gs/gdk/spinner';
import { CommonLayoutComponent } from "./configurations/common-layout/common-layout.component";
import { LayoutListingComponent } from "./layout-listing.component";
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { StandardLayoutComponent } from "./standard-layout/standard-layout.component";
import { ManageAssignmentModule } from "./manage-assignment/manage-assignment.module";
import { MigrateComponent } from './migrate/migrate.component';
import { FlexModule } from "@angular/flex-layout";
import { RelationshipViewComponent } from './configurations/relationship-view/relationship-view.component';
import { ConfigurationsComponent } from "./configurations/configurations.component";
import { NzButtonModule } from "@gs/ng-horizon/button";
import { NzCheckboxModule } from "@gs/ng-horizon/checkbox";
import { NzDropDownModule } from "@gs/ng-horizon/dropdown";
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from "@gs/ng-horizon/icon";
import { NzInputModule } from "@gs/ng-horizon/input";
import { NzModalModule } from "@gs/ng-horizon/modal";
import { NzTabsModule } from "@gs/ng-horizon/tabs";
import { NzTypographyModule } from "@gs/ng-horizon/typography";
import { ObjectAssociationsComponent } from "./configurations/object-associations/object-associations.component";
import { AssociationConditionsComponent } from './configurations/object-associations/association-conditions/association-conditions.component';
import { NzTagModule } from "@gs/ng-horizon/tag";
import { NzDrawerModule } from "@gs/ng-horizon/drawer";
import { NzSelectModule } from "@gs/ng-horizon/select";
import { NzSwitchModule } from "@gs/ng-horizon/switch";
import { NzToolTipModule } from "@gs/ng-horizon/tooltip";
import { AddAssociationModule } from "./configurations/object-associations/add-association/add-association.module";
import { AdminRolloutC360Module } from "../../rollout-c360/admin/admin.module";
import { GridColumnChooserModule } from '@gs/cs360-lib/src/common';
import { EnvironmentModule } from '@gs/gdk/services/environment';
import { NzI18nModule } from "@gs/ng-horizon/i18n";
import { StandardLayoutModule } from "./standard-layout/standard-layout.module";
import { LayoutsListingGridModule } from "./shared/layouts-listing-grid/layouts-listing-grid.module";
import { CommonLayoutModule } from "./configurations/common-layout/common-layout.module";
import {NzListModule} from "@gs/ng-horizon/list";
import { LayoutPreviewModule } from "../layout-preview/layout-preview.module";
import { PartnerRouteGuard } from "./partner-route-guard";
import { StandardRouteGuard } from "./standard-route-guard";
import { ConfigurationsRouteGuard } from "./configurations-route-guard";

const routes: Routes = [
  { path: '', redirectTo: 'standard', pathMatch: 'full' },
  {
      path: '', component: LayoutListingComponent, children: [
          { path: 'standard', component: StandardLayoutComponent, canActivate: [StandardRouteGuard] },
          { path: 'partner', component: StandardLayoutComponent, canActivate: [PartnerRouteGuard] },
          {
            path: 'configurations',
            component: ConfigurationsComponent,
            children: [
              { path: '', redirectTo: 'common', pathMatch: 'preserve' },
              { path: 'common', component: CommonLayoutComponent },
              { path: 'associations', component: ObjectAssociationsComponent },
              { path: 'relationship', component: RelationshipViewComponent }
            ]
          },
          { path: 'migrate', component: MigrateComponent }
    ]
  },
];

@NgModule({
  declarations: [
    // CommonLayoutComponent,
    LayoutListingComponent,
    MigrateComponent,
    RelationshipViewComponent,
    ConfigurationsComponent,
    ObjectAssociationsComponent,
    AssociationConditionsComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NzTabsModule,
        NzInputModule,
        NzIconModule,
        NzSelectModule,
        NzSwitchModule,
        FieldTreeModule,
        NzPopoverModule,
        NzTagModule,
        NzCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        NzFormModule,
        NzIconModule,
        NzButtonModule,
        NzToolTipModule,
        NzDropDownModule,
        GridModule,
        // MatListModule,
        SpinnerModule,
        NzModalModule,
        NzTypographyModule,
        ManageAssignmentModule,
        FlexModule,
        AddAssociationModule,
        NzDrawerModule,
        AdminRolloutC360Module,
        GridColumnChooserModule,
        GsPipesModule,
        EnvironmentModule,
        NzI18nModule,
        NzListModule,
        StandardLayoutModule,
        LayoutsListingGridModule,
        CommonLayoutModule,
        LayoutPreviewModule
    ],
  entryComponents: [AssociationConditionsComponent],
  providers: [PartnerRouteGuard, StandardRouteGuard, ConfigurationsRouteGuard]
})
export class LayoutListingModule { }
