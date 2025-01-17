import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { SpinnerModule } from '@gs/gdk/spinner';
import {RouterModule, Routes} from "@angular/router";
import {LayoutPreviewComponent} from "./layout-preview.component";
import { NzSelectModule } from "@gs/ng-horizon/select";
import { NzIconModule } from "@gs/ng-horizon/icon";
import { NzTypographyModule } from "@gs/ng-horizon/typography";
import { NzSkeletonModule } from "@gs/ng-horizon/skeleton";
import { LayoutPreviewService } from "./layout-preview.service";
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzButtonModule } from '@gs/ng-horizon/button';

@NgModule({
  declarations: [LayoutPreviewComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerModule,
    NzSelectModule,
    NzIconModule,
    NzTypographyModule,
    NzSkeletonModule,
    NzI18nModule,
    NzModalModule,
    NzButtonModule
  ],
  providers: [LayoutPreviewService],
  exports: [LayoutPreviewComponent]
})
export class LayoutPreviewModule { }
