import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsmLeadsComponent } from './csm-leads.component';
import {LazyElementsModule} from "@angular-extensions/elements";

@NgModule({
  declarations: [CsmLeadsComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  exports: [CsmLeadsComponent],
  entryComponents: [CsmLeadsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmLeadsModule {
  static entry = CsmLeadsComponent;
}
