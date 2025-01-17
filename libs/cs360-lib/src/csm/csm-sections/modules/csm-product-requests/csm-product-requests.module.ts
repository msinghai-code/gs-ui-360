import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsmProductRequestsComponent } from './csm-product-requests.component';
import {LazyElementsModule} from "@angular-extensions/elements";

@NgModule({
  declarations: [CsmProductRequestsComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  exports: [CsmProductRequestsComponent],
  entryComponents: [CsmProductRequestsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmProductRequestsModule {
  static entry = CsmProductRequestsComponent;
}
