import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DefaultWidgetComponent } from './default-widget.component';
import { DefaultWidgetSettingComponent } from './default-widget-setting/default-widget-setting.component';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzListModule } from '@gs/ng-horizon/list';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzStepsModule } from '@gs/ng-horizon/steps';
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
  NzTypographyModule,
  NzDrawerModule,
  NzButtonModule,
  NzIconModule,
  NzInputModule,
  NzListModule,
  NzFormModule,
  NzEmptyModule,
  NzSkeletonModule
];

@NgModule({
  declarations: [DefaultWidgetComponent, DefaultWidgetSettingComponent],
  imports: [
    CommonModule,
    GridsterModule,
    DragDropModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    ...nzModules,
    DocumentEventModule
  ],
  entryComponents: [DefaultWidgetComponent, DefaultWidgetSettingComponent]
})
export class DefaultWidgetModule { }
