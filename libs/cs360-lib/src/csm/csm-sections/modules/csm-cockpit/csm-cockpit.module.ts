import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsmCockpitComponent } from './csm-cockpit.component';
import { LazyElementsModule } from '@angular-extensions/elements';

@NgModule({
  declarations: [CsmCockpitComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  entryComponents:[CsmCockpitComponent],
  exports: [CsmCockpitComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmCockpitModule {
  static entry = CsmCockpitComponent;
}
