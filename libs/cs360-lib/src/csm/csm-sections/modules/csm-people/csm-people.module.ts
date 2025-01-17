import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {LazyElementsModule} from "@angular-extensions/elements";

import { CsmPeopleComponent } from './csm-people.component';

@NgModule({
  declarations: [CsmPeopleComponent],
  imports: [
    CommonModule,
    LazyElementsModule
  ],
  entryComponents:[CsmPeopleComponent],
  exports: [CsmPeopleComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmPeopleModule {
  static entry = CsmPeopleComponent;
}
