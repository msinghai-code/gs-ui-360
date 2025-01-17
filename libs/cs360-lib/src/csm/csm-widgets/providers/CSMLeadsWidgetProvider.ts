import { AbstractWidgetProvider } from './CSMAbstractWidgetProvider';
import {LeadsWidgetComponent} from "../modules/leads-widget/leads-widget.component";

// @dynamic
export class CSMLeadsWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return LeadsWidgetComponent
    }
}
