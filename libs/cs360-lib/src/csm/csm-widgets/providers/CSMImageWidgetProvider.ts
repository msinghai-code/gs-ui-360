import { ImageWidgetCsmComponent } from "../modules/image-widget/image-widget-csm.component";
import {AbstractWidgetProvider} from "./CSMAbstractWidgetProvider";

// @dynamic
export class ImageWidgetProvider extends AbstractWidgetProvider{
    constructor() { super();}
    public static getWidgetView() {
        return ImageWidgetCsmComponent
    }
}