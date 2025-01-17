import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyElementsModule } from "@angular-extensions/elements";

import { BaseWidgetRendererComponent } from './base-widget-renderer.component';

@NgModule({
  declarations: [BaseWidgetRendererComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  entryComponents: [BaseWidgetRendererComponent],
  exports: [BaseWidgetRendererComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BaseWidgetRendererModule { }
