import { AbstractWidgetProvider } from './CSMAbstractWidgetProvider';
import { NpsWidgetComponent } from "../modules/nps-widget/nps-widget.component";

// @dynamic
export class NPSWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return NpsWidgetComponent
    }
}

