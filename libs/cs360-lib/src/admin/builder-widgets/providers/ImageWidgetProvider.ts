import { ImageWidgetBuilderComponent } from "../modules/image-widget/image-widget-builder.component";
import { ImageWidgetSettingsComponent } from "../modules/image-widget/image-widget-settings/image-widget-settings.component";
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/csm';

// @dynamic
export class ImageWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return ImageWidgetBuilderComponent
    }
}

// @dynamic
export class ImageWidgetSettingProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return ImageWidgetSettingsComponent
    }
}
