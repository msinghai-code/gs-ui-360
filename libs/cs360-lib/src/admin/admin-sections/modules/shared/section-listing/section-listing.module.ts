import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BaseTreeModule } from "@gs/gdk/base-tree";
import { AddInfoAndMarkDragStatusPipe, SectionListingComponent, FilterItemsPipe } from './section-listing.component';
import { GsPipesModule } from "@gs/gdk/pipes";
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzCollapseModule } from '@gs/ng-horizon/collapse';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { ReportListingByObjectAssociationModule } from "@gs/report/reports-configuration";
import { NzI18nModule } from '@gs/ng-horizon/i18n';


@NgModule({
  declarations: [SectionListingComponent, AddInfoAndMarkDragStatusPipe, FilterItemsPipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCollapseModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    FlexLayoutModule,
    NzSkeletonModule,
    NzToolTipModule,
    BaseTreeModule,
    DragDropModule,
    GsPipesModule,
    DocumentEventModule,
    ReportListingByObjectAssociationModule,
    NzI18nModule
  ],
  providers: [
  ],
  exports: [SectionListingComponent]
})
export class SectionListingModule { }
