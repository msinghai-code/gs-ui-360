import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CustomColumnChartWidgetComponent } from './custom-column-chart-widget.component';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzResultModule } from '@gs/ng-horizon/result';
import { NzTypographyModule } from '@gs/ng-horizon/typography';

@NgModule({
  declarations: [CustomColumnChartWidgetComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NzSkeletonModule,
    NzToolTipModule,
    NzTypographyModule,
    NzIconModule,
    NzResultModule
  ],
  entryComponents: [CustomColumnChartWidgetComponent]
})
export class CustomColumnChartWidgetModule { }
