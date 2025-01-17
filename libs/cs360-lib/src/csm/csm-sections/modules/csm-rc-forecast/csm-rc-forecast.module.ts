import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsmRcForecastComponent } from './csm-rc-forecast.component';
import {LazyElementsModule} from "@angular-extensions/elements";

@NgModule({
  declarations: [CsmRcForecastComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  exports: [CsmRcForecastComponent],
  entryComponents: [CsmRcForecastComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmRcForecastModule {
  static entry = CsmRcForecastComponent;
}
