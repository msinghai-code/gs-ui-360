import { TextWidgetSettingsComponent } from "../modules/text-widget/text-widget-settings/text-widget-settings.component";
import { TextWidgetComponent } from "../modules/text-widget/text-widget.component";
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/csm';

// @dynamic
export class TextWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return TextWidgetComponent
    }
}

// @dynamic
export class TextWidgetSettingProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return TextWidgetSettingsComponent
    }
}
