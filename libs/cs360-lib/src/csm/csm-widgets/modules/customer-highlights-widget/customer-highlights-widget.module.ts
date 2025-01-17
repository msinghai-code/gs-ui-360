import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {LazyElementsModule} from "@angular-extensions/elements";

import {NzSkeletonModule} from "@gs/ng-horizon/skeleton";
import { NzIconModule } from "@gs/ng-horizon/icon";
import { NzTypographyModule } from '@gs/ng-horizon/typography';

import { CustomerHighlightsCsmComponent } from './customer-highlights-widget.component';

@NgModule({
  declarations: [CustomerHighlightsCsmComponent],
  imports: [
    CommonModule,
    NzSkeletonModule,
    NzTypographyModule,
    LazyElementsModule,
    NzIconModule
  ],
  entryComponents: [CustomerHighlightsCsmComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CustomerHighlightsWidgetModule { }
