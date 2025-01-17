import { CustomerHighlightsWidgetComponent } from "../modules/customer-highlights-widget/customer-highlights-widget.component";
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/csm';

export class CustomerHighlightsWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return CustomerHighlightsWidgetComponent;
    }
}
