import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickTimelineComponent } from './quick-timeline.component';
import { LazyElementsModule } from '@angular-extensions/elements';

@NgModule({
  declarations: [QuickTimelineComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  entryComponents:[QuickTimelineComponent],
  exports: [QuickTimelineComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class QuickTimelineModule { }
