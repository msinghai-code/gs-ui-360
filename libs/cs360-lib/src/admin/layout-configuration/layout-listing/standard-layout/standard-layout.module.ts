import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatListModule } from "@angular/material";
import { Routes, RouterModule } from "@angular/router";
import { GsPipesModule } from "@gs/gdk/pipes";
import { GridModule} from "@gs/gdk/grid";
import { FieldTreeModule } from "@gs/gdk/field-tree";
import { SpinnerModule } from '@gs/gdk/spinner';
// import { LayoutsListingGridComponent } from "../shared/layouts-listing-grid/layouts-listing-grid.component";
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { StandardLayoutComponent } from "../standard-layout/standard-layout.component";
import { ManageAssignmentModule } from "../manage-assignment/manage-assignment.module";
import { FlexModule } from "@angular/flex-layout";
import { NzButtonModule } from "@gs/ng-horizon/button";
import { NzCheckboxModule } from "@gs/ng-horizon/checkbox";
import { NzDropDownModule } from "@gs/ng-horizon/dropdown";
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from "@gs/ng-horizon/icon";
import { NzInputModule } from "@gs/ng-horizon/input";
import { NzModalModule } from "@gs/ng-horizon/modal";
import { NzTabsModule } from "@gs/ng-horizon/tabs";
import { NzTypographyModule } from "@gs/ng-horizon/typography";
import { NzTagModule } from "@gs/ng-horizon/tag";
import { NzDrawerModule } from "@gs/ng-horizon/drawer";
import { NzSelectModule } from "@gs/ng-horizon/select";
import { NzSwitchModule } from "@gs/ng-horizon/switch";
import { NzToolTipModule } from "@gs/ng-horizon/tooltip";
import { GridColumnChooserModule } from '@gs/cs360-lib/src/common';
import { EnvironmentModule } from '@gs/gdk/services/environment';
import { NzI18nModule } from "@gs/ng-horizon/i18n";
import { LayoutsListingGridModule } from "../shared/layouts-listing-grid/layouts-listing-grid.module";
import { LayoutPreviewModule } from "../../layout-preview/layout-preview.module";



@NgModule({
  declarations: [
    StandardLayoutComponent,
    // LayoutsListingGridComponent
  ],
  imports: [
    CommonModule,
    // RouterModule.forChild(routes),
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
    MatListModule,
    SpinnerModule,
    NzModalModule,
    NzTypographyModule,
    ManageAssignmentModule,
    FlexModule,
    NzDrawerModule,
    GridColumnChooserModule,
    GsPipesModule,
    EnvironmentModule,
    NzI18nModule,
    LayoutsListingGridModule,
    LayoutPreviewModule
  ],
  exports: [StandardLayoutComponent]
})
export class StandardLayoutModule { }
