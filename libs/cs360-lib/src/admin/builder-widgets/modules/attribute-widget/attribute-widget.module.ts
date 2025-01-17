import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AttributeWidgetSettingComponent } from './attribute-widget-setting/attribute-widget-setting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {AttributeWidgetBuilderComponent, FieldPathPipe} from './attribute-widget-builder/attribute-widget-builder.component';
import { FieldConfigurationModule } from '@gs/cs360-lib/src/common';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzStepsModule } from '@gs/ng-horizon/steps';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import {FieldChooserModule} from "@gs/gdk/field-chooser";
import {NzSpinModule} from "@gs/ng-horizon/spin";
import { NzCollapseModule } from '@gs/ng-horizon/collapse';

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
  NzToolTipModule,
  NzI18nModule,NzCollapseModule
];

@NgModule({
  declarations: [AttributeWidgetSettingComponent, AttributeWidgetBuilderComponent, FieldPathPipe],
  imports: [
    CommonModule,
    GridsterModule,
    DragDropModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FieldConfigurationModule,
    ...nzModules,
    DocumentEventModule,
      FieldChooserModule
  ],
  entryComponents: [AttributeWidgetSettingComponent, AttributeWidgetBuilderComponent]
})
export class AttributeWidgetModule { }
