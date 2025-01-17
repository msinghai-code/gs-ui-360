import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicInsightsWidgetComponent } from './basic-insights-widget.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SpinnerModule } from '@gs/gdk/spinner';
import { NzCardModule } from '@gs/ng-horizon/card';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzTypographyModule } from '@gs/ng-horizon/typography';

export interface BasicInsightItem {
  label: string;
  value: string | number | any;
}


@NgModule({
  entryComponents: [BasicInsightsWidgetComponent],
  declarations: [BasicInsightsWidgetComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NzSkeletonModule, NzTypographyModule, NzCardModule,
    SpinnerModule
  ]
})
export class BasicInsightsWidgetModule {
}
