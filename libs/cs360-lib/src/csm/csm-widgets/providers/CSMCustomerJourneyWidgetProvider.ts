import { CustomerJourneyCsmComponent } from "../modules/customer-journey/customer-journey-csm.component";
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";

// @dynamic
export class CustomerJourneyWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return new Promise((resolve) => resolve(CustomerJourneyCsmComponent));
    }
}
