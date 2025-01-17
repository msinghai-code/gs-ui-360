import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {LazyElementsModule} from "@angular-extensions/elements";

import { QuickPersonComponent } from './quick-person.component';

@NgModule({
  declarations: [QuickPersonComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  entryComponents:[QuickPersonComponent],
  exports: [QuickPersonComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class QuickPersonModule { }
