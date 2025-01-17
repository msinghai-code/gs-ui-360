import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LazyElementsModule } from "@angular-extensions/elements";

import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';

import { CsatWidgetComponent } from './csat-widget.component';
import { SurveyFilter } from './pipes';


@NgModule({
    declarations: [CsatWidgetComponent, SurveyFilter],
    imports: [
        CommonModule,
        NzSkeletonModule,
        LazyElementsModule
    ],
    exports: [CsatWidgetComponent],
    entryComponents: [CsatWidgetComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsatWidgetModule {
}

