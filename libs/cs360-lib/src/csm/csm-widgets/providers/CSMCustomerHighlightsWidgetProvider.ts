
import { CustomerHighlightsCsmComponent } from "../modules/customer-highlights-widget/customer-highlights-widget.component";
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";

// @dynamic
export class CustomerHighlightsWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return new Promise((resolve) => resolve(CustomerHighlightsCsmComponent));
    }
}
