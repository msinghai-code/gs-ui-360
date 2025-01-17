/***
 * created by rpal on jun 10 2020
 */

import { SummaryReportWidgetSettingsComponent } from '@gs/cs360-lib/src/common';
import { SummaryReportWidgetComponent } from '@gs/cs360-lib/src/common';
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";

// @dynamic
export class ReportWidgetProvider extends AbstractWidgetProvider {
    constructor() { super();}
    public static getWidgetView() {
        return new Promise(resolve => resolve(SummaryReportWidgetComponent));
    }
}

// @dynamic
export class ReportWidgetSettingsProvider extends AbstractWidgetProvider {
    constructor() { super();}
    public static getWidgetView() {
        return new Promise(resolve => resolve(SummaryReportWidgetSettingsComponent));
    }
}
