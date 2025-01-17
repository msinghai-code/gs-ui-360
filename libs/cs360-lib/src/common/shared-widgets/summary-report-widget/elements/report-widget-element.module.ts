import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { SpinnerModule } from '@gs/gdk/spinner';
import {NzResultModule} from '@gs/ng-horizon/result';
import {LazyElementsModule} from "@angular-extensions/elements";
import {ReportWidgetCs360ElementLoader, ReportWidgetElementDirective} from "./report-widget-element.loader";

@NgModule({
    declarations: [ReportWidgetElementDirective, ReportWidgetCs360ElementLoader],
    imports:[
        CommonModule,
        LazyElementsModule,
        SpinnerModule,
        NzResultModule
    ],
    entryComponents: [ReportWidgetCs360ElementLoader],
    exports: [ReportWidgetCs360ElementLoader],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReportWidgetElementModule { }
