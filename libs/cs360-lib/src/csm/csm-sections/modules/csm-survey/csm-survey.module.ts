import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {LazyElementsModule} from "@angular-extensions/elements";
import { NzSkeletonModule } from "@gs/ng-horizon/skeleton";
import { CsmSurveyComponent } from './csm-survey.component';
import { NzI18nModule} from "@gs/ng-horizon/i18n";
@NgModule({
  declarations: [CsmSurveyComponent],
  imports: [
    CommonModule,
    NzSkeletonModule,
    LazyElementsModule,
    NzI18nModule
  ],
  entryComponents:[CsmSurveyComponent],
  exports: [CsmSurveyComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmSurveyModule {
  static entry = CsmSurveyComponent;
}
