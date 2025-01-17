import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";
import { CiWidgetComponent } from '../modules/ci-widget/ci-widget.component';

// @dynamic
export class CSMCiWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView(type?: any) {
        return CiWidgetComponent;
    }
}