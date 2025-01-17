import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule} from "@gs/gdk/grid";
import { SpinnerModule } from '@gs/gdk/spinner';
import { ManageAssignmentComponent } from "./manage-assignment.component";
import { ManageAssignmentService } from "./manage-assignment.service";
import { AssignmentConditionsComponent, FilterValueFormatPipe } from './assignment-conditions/assignment-conditions.component';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzTagModule } from '@gs/ng-horizon/tag';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzIconModule } from '@gs/ng-horizon/icon';
// import {BaseGlobalFilterChipModule} from "@gs/core";
// import {GlobalFilterChipModule} from "@gs/gdk/filter/global/global-filter-chip/global-filter-chip.module";
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { FilterQueryService } from '@gs/gdk/filter/builder'
import { GlobalFilterLabelReaderPipeModule } from '@gs/gdk/filter/global';
// globalFilterFieldLabelTooltipFormat is imported from BaseGlobalFilterChipModule
// import { BaseGlobalFilterChipModule } from "@gs/core";

@NgModule({
  declarations: [ManageAssignmentComponent, FilterValueFormatPipe, AssignmentConditionsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    GridModule,
    NzTypographyModule,
    NzButtonModule,
    NzSelectModule,
    SpinnerModule,
    NzTagModule,
    FormsModule,
    NzInputModule,
    ReactiveFormsModule,
    NzFormModule,
    // BaseGlobalFilterChipModule,
    // GlobalFilterChipModule,
    GlobalFilterLabelReaderPipeModule,
    NzToolTipModule,
    NzIconModule,
    NzI18nModule
  ],
  entryComponents: [ManageAssignmentComponent, AssignmentConditionsComponent],
  exports: [ManageAssignmentComponent],
  providers: [ManageAssignmentService, FilterQueryService]
})
export class ManageAssignmentModule { }
