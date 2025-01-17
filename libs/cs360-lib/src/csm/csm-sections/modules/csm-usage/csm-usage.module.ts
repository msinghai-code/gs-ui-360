import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsmUsageComponent } from './csm-usage.component';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import {LazyElementsModule} from "@angular-extensions/elements";

@NgModule({
  declarations: [CsmUsageComponent],
  imports: [
    CommonModule,
    NzEmptyModule,
    LazyElementsModule
  ],
  entryComponents: [CsmUsageComponent],
  exports: [CsmUsageComponent],
  providers: [],
  schemas : [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmUsageModule {
  static entry = CsmUsageComponent;
}
