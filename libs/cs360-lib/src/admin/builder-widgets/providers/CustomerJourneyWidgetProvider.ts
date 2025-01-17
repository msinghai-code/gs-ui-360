

import { CustomerJourneySettingsComponent } from "../modules/customer-journey/customer-journey-builder-settings/customer-journey-builder-settings.component";
import { CustomerJourneyBuilderComponent } from "../modules/customer-journey/customerJourney-widget-builder/customer-journey-builder.component";
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/csm';

export class CustomerJourneyWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return CustomerJourneyBuilderComponent
    }
}

export class CustomerJourneySettingProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return CustomerJourneySettingsComponent
    }
    public static getWidgetSettingsWidth() {
        return 60;
    }
}