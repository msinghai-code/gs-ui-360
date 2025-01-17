import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyElementsModule } from '@angular-extensions/elements';
import { CsmSuccessplanComponent } from './csm-successplan.component';

@NgModule({
  declarations: [CsmSuccessplanComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  exports: [CsmSuccessplanComponent],
  entryComponents: [CsmSuccessplanComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmSuccessplanModule {
  static entry = CsmSuccessplanComponent;
}
