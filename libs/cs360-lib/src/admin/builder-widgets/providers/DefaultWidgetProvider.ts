import { DefaultWidgetSettingComponent } from "../modules/default-widget/default-widget-setting/default-widget-setting.component";
import { DefaultWidgetComponent } from "../modules/default-widget/default-widget.component";
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/csm';

// @dynamic
export class DefaultWidgetProvider extends AbstractWidgetProvider{
    constructor() { super();}
    public static getWidgetView() {
        return DefaultWidgetComponent;
    }
}

// @dynamic
export class DefaultWidgetSettingProvider extends AbstractWidgetProvider{
    constructor() { super();}
    public static getWidgetView() {
        return DefaultWidgetSettingComponent;
    }
}
