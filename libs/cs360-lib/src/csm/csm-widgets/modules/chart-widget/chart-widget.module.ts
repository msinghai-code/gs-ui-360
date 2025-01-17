import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from '@gs/gdk/visualizer/chart';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartWidgetComponent } from './chart-widget.component';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
@NgModule({
  declarations: [ChartWidgetComponent],
  imports: [
    CommonModule,
    ChartModule,
    FlexLayoutModule,
    NzSkeletonModule,
    NzTypographyModule
  ],
  entryComponents: [ChartWidgetComponent]
})
export class ChartWidgetModule { }
