import { DefaultWidgetComponent } from "../modules/default-widget/default-widget.component";
import {AbstractWidgetProvider} from "./CSMAbstractWidgetProvider";

// @dynamic
export class DefaultWidgetProvider extends AbstractWidgetProvider{
    constructor() { super();}
    public static getWidgetView(c) {
        return DefaultWidgetComponent;
    }
}
