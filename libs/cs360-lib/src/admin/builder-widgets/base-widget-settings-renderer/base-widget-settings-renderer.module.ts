import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LazyElementsModule } from "@angular-extensions/elements";

import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzTabsModule } from '@gs/ng-horizon/tabs';


import { BaseWidgetSettingsRendererComponent } from './base-widget-settings-renderer.component';
import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
  declarations: [BaseWidgetSettingsRendererComponent],
  imports: [
    CommonModule,
    LazyElementsModule,
    FlexLayoutModule,
    NzTabsModule,
    NzIconModule,
    NzI18nModule 
  ],
  entryComponents: [BaseWidgetSettingsRendererComponent],
  exports: [BaseWidgetSettingsRendererComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BaseWidgetSettingsRendererModule { }
