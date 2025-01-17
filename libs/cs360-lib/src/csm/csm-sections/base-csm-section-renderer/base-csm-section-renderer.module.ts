import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LazyElementsModule } from "@angular-extensions/elements";

import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzTabsModule } from '@gs/ng-horizon/tabs';
import { NzI18nModule } from '@gs/ng-horizon/i18n';


import { BaseCsmSectionRendererComponent } from './base-csm-section-renderer.component';

@NgModule({
  declarations: [BaseCsmSectionRendererComponent],
  imports: [
    CommonModule,
    LazyElementsModule,
    FlexLayoutModule,
    NzTabsModule,
    NzIconModule,
    NzI18nModule 
  ],
  entryComponents: [BaseCsmSectionRendererComponent],
  exports: [BaseCsmSectionRendererComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BaseCsmSectionRendererModule { }
