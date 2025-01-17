import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HealthscoreWidgetSettingsComponent } from './healthscore-widget-settings/healthscore-widget-settings.component';
import { HealthscoreWidgetComponent } from './healthscore-widget.component';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzStepsModule } from '@gs/ng-horizon/steps';
import { NzSwitchModule } from '@gs/ng-horizon/switch';
import { NzTypographyModule } from '@gs/ng-horizon/typography';

const nzModules = [
  NzModalModule,
  NzInputModule,
  NzStepsModule,
  NzTypographyModule,
  NzFormModule,
  NzIconModule,
  NzCheckboxModule,
  NzButtonModule,
  NzDrawerModule,
  NzButtonModule,
  NzIconModule,
  NzInputModule,
  NzFormModule,
  NzEmptyModule,
  NzSkeletonModule,
  NzSwitchModule
];
@NgModule({
  declarations: [HealthscoreWidgetComponent, HealthscoreWidgetSettingsComponent],
  imports:  [
  CommonModule,
  GridsterModule,
  DragDropModule,
  FlexLayoutModule,
  FormsModule,
  ReactiveFormsModule,
  ...nzModules,
  DocumentEventModule
],
  entryComponents: [HealthscoreWidgetComponent, HealthscoreWidgetSettingsComponent]
})
export class HealthscoreWidgetModule { }
