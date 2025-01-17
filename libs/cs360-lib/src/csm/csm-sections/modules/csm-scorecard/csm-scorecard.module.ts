import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsmScorecardComponent  } from './csm-scorecard.component';
import { LazyElementsModule } from '@angular-extensions/elements';

@NgModule({
  declarations: [CsmScorecardComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  entryComponents:[CsmScorecardComponent],
  exports: [CsmScorecardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmScorecardModule {
  static entry = CsmScorecardComponent;
}

