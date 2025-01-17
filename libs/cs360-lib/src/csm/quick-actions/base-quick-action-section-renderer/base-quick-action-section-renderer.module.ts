import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyElementsModule } from "@angular-extensions/elements";

import { BaseQuickActionSectionRendererComponent } from './base-quick-action-section-renderer.component';

@NgModule({
  declarations: [BaseQuickActionSectionRendererComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  entryComponents: [BaseQuickActionSectionRendererComponent],
  exports: [BaseQuickActionSectionRendererComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BaseQuickActionSectionRendererModule { }
