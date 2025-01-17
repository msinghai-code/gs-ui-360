import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LazyElementsModule } from "@angular-extensions/elements";

import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';

import { NpsWidgetComponent } from './nps-widget.component';


@NgModule({
    declarations: [NpsWidgetComponent],
    imports: [
        CommonModule,
        NzSkeletonModule,
        LazyElementsModule
    ],
    exports: [NpsWidgetComponent],
    entryComponents: [NpsWidgetComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NpsWidgetModule {
}
