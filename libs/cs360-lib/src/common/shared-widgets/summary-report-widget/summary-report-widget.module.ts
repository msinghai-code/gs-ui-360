import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartIcon, SummaryReportWidgetComponent } from './summary-report-widget.component';
import { SummaryReportWidgetSettingsComponent } from './settings/settings.component';
import { FieldTreeModule } from "@gs/gdk/field-tree";
import { SpinnerModule } from '@gs/gdk/spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularResizedEventModule } from "angular-resize-event";
import { LazyElementsModule } from '@angular-extensions/elements';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzResultModule } from '@gs/ng-horizon/result';
import {SummaryReportWidgetService} from "./summary-report-widget.service";
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzI18nModule} from '@gs/ng-horizon/i18n';

@NgModule({
  declarations: [SummaryReportWidgetComponent, SummaryReportWidgetSettingsComponent, ChartIcon],
  entryComponents: [
    SummaryReportWidgetComponent,
    SummaryReportWidgetSettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SpinnerModule,
    AngularResizedEventModule,
    ReactiveFormsModule,
    LazyElementsModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    NzDropDownModule,
    FieldTreeModule,
    FlexLayoutModule,
    NzFormModule,
    NzResultModule,
    NzI18nModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [SummaryReportWidgetService]
})
export class SummaryReportWidgetModule { }
