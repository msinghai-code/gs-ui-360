import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SpinnerModule } from '@gs/gdk/spinner';
import { DefaultThreeLevelWidgetCsmComponent } from './default-three-level-widget-csm.component';
import { NzCardModule } from '@gs/ng-horizon/card';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { ShowIfEllipsisModule } from "@gs/cs360-lib/src/common";
import { NzIconModule } from '@gs/ng-horizon/icon';

const nzModules = [
  NzSkeletonModule,
  NzTypographyModule,
  NzCardModule,
  NzIconModule
];

@NgModule({
  declarations: [DefaultThreeLevelWidgetCsmComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ...nzModules,
    SpinnerModule,
    NzToolTipModule ,
    ShowIfEllipsisModule
  ],
  entryComponents: [DefaultThreeLevelWidgetCsmComponent]
})
export class DefaultThreeLevelWidgetModule { }
