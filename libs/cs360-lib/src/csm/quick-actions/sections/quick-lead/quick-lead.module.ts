import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {QuickLeadComponent} from "./quick-lead.component";
import {CommonModule} from "@angular/common";
import {LazyElementsModule} from "@angular-extensions/elements";

@NgModule({
    declarations: [QuickLeadComponent],
    imports: [
        CommonModule,
        LazyElementsModule
    ],
    entryComponents: [QuickLeadComponent],
    exports: [QuickLeadComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class QuickLeadModule {}
