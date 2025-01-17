import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { ReportsConfigurationModule } from "@gs/report/reports-configuration";
import {ReportConfigWrapperComponent} from "./report-config-wrapper/report-config-wrapper.component";
import {R360ReportConfigWrapperComponent} from "./r360-report-config-wrapper/r360-report-config-wrapper.component";
@NgModule({
    declarations: [
        ReportConfigWrapperComponent,
        R360ReportConfigWrapperComponent
    ],
    entryComponents: [ReportConfigWrapperComponent,R360ReportConfigWrapperComponent],
    imports: [
        ReportsConfigurationModule
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [ReportConfigWrapperComponent],
    exports: [
        ReportConfigWrapperComponent,
        R360ReportConfigWrapperComponent
    ]
})
export class ReportsConfigWrapperModule { }
