import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartModule } from '@gs/gdk/visualizer/chart';
import { CiWidgetComponent } from './ci-widget.component';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzSpinModule } from '@gs/ng-horizon/spin';
import { LazyElementsModule } from '@angular-extensions/elements';

@NgModule({
  declarations: [CiWidgetComponent],
  imports: [
    CommonModule,
    ChartModule,
    FlexLayoutModule,
    NzSkeletonModule,
    NzSpinModule,
    LazyElementsModule
  ],
  entryComponents: [CiWidgetComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CompanyIntelligenceWidgetModule{ }
