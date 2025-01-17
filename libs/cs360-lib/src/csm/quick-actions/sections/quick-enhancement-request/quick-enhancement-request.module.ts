import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {QuickEnhancementRequestComponent} from "./quick-enhancement-request.component";
import {LazyElementsModule} from "@angular-extensions/elements";

@NgModule({
  declarations: [QuickEnhancementRequestComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  exports: [QuickEnhancementRequestComponent],
  entryComponents: [QuickEnhancementRequestComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class QuickEnhancementRequestModule { }
