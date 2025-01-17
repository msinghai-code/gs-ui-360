import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LazyElementsModule } from "@angular-extensions/elements";

import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzTabsModule } from '@gs/ng-horizon/tabs';


import { BaseAdminSectionRendererComponent } from './base-admin-section-renderer.component';
import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
  declarations: [BaseAdminSectionRendererComponent],
  imports: [
    CommonModule,
    LazyElementsModule,
    FlexLayoutModule,
    NzTabsModule,
    NzIconModule,
    NzI18nModule 
  ],
  entryComponents: [BaseAdminSectionRendererComponent],
  exports: [BaseAdminSectionRendererComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BaseAdminSectionRendererModule { }
