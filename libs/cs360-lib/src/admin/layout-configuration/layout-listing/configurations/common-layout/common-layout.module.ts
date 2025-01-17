import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonLayoutComponent } from "./common-layout.component";
import { SpinnerModule } from '@gs/gdk/spinner';
import { NzTypographyModule } from "@gs/ng-horizon/typography";
import { EnvironmentModule } from '@gs/gdk/services/environment';
import { NzI18nModule } from "@gs/ng-horizon/i18n";
import { LayoutsListingGridModule } from "../../shared/layouts-listing-grid/layouts-listing-grid.module";



@NgModule({
  declarations: [
    CommonLayoutComponent
  ],
  imports: [
    CommonModule,
    SpinnerModule,
    NzTypographyModule,
    EnvironmentModule,
    NzI18nModule,
    LayoutsListingGridModule
  ],
  exports: [CommonLayoutComponent]
})
export class CommonLayoutModule { }
