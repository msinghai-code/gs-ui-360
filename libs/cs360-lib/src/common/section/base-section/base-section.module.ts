
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from './base-section.component';

@NgModule({
  declarations: [
    BaseSectionComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [BaseSectionComponent],
  entryComponents: [BaseSectionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BaseSectionModule { }