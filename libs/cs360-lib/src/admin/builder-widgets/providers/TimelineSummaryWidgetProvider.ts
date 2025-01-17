import { DefaultWidgetSettingComponent } from "../modules/default-widget/default-widget-setting/default-widget-setting.component";
import { TimelineWidgetComponent } from "../modules/timeline-widget/timeline-widget.component";
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/csm';

// @dynamic
export class TimelineSummaryWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return TimelineWidgetComponent
    }
}

// @dynamic
export class TimelineSummaryWidgetSettingProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return DefaultWidgetSettingComponent
    }
}
