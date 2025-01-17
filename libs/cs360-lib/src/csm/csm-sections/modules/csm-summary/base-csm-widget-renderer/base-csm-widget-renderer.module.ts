import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyElementsModule } from "@angular-extensions/elements";

import { BaseCsmWidgetRendererComponent } from './base-csm-widget-renderer.component';
import {FlexModule} from "@angular/flex-layout";

@NgModule({
  declarations: [BaseCsmWidgetRendererComponent],
    imports: [
        CommonModule,
        LazyElementsModule,
        FlexModule
    ],
  entryComponents: [BaseCsmWidgetRendererComponent],
  exports: [BaseCsmWidgetRendererComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BaseCsmWidgetRendererModule { }
