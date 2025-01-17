import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {LazyElementsModule} from "@angular-extensions/elements";

import {NzSkeletonModule} from "@gs/ng-horizon/skeleton";
import { NzIconModule } from "@gs/ng-horizon/icon";

import { HealthScoreWidgetComponent } from './healthscore-widget.component'
import { NzTypographyModule } from '@gs/ng-horizon/typography';
@NgModule({
  declarations: [HealthScoreWidgetComponent],
  imports: [
    CommonModule,
    NzSkeletonModule,
    NzTypographyModule,
    LazyElementsModule,
    NzIconModule
  ],
  entryComponents: [HealthScoreWidgetComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HealthScoreWidgetModule { }
