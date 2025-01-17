import { CsatWidgetComponent } from "../modules/csat-widget/csat-widget.component";
import { AbstractWidgetProvider } from './CSMAbstractWidgetProvider';

// @dynamic
export class CSATWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return CsatWidgetComponent
    }
}

