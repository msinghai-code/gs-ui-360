import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsmTimelineComponent } from './csm-timeline.component';
import { LazyElementsModule } from '@angular-extensions/elements';

@NgModule({
  declarations: [CsmTimelineComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  entryComponents:[CsmTimelineComponent],
  exports: [CsmTimelineComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmTimelineModule {
  static entry = CsmTimelineComponent;
}
