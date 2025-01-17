import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DefaultThreeLevelWidgetBuilderComponent } from './default-three-level-widget-builder/default-three-level-widget-builder.component';
import { SpinnerModule } from '@gs/gdk/spinner';
import { NzCardModule } from '@gs/ng-horizon/card';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzTypographyModule } from '@gs/ng-horizon/typography';

const nzModules = [
  NzSkeletonModule,
  NzTypographyModule,
  NzCardModule
];

@NgModule({
  declarations: [DefaultThreeLevelWidgetBuilderComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ...nzModules,
    SpinnerModule
  ],
  entryComponents: [DefaultThreeLevelWidgetBuilderComponent]
})
export class DefaultThreeLevelWidgetModule { }
