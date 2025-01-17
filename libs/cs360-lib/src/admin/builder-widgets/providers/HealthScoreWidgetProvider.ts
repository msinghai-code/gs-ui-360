import { HealthscoreWidgetSettingsComponent } from "../modules/healthscore-widget/healthscore-widget-settings/healthscore-widget-settings.component";
import { HealthscoreWidgetComponent } from '../modules/healthscore-widget/healthscore-widget.component';
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/csm';

// @dynamic
export class HealthScoreWidgetProvider extends AbstractWidgetProvider{
    constructor() { super();}
    public static getWidgetView() {
        return HealthscoreWidgetComponent;
    }
}

// @dynamic
export class HealthScoreWidgetSettingProvider extends AbstractWidgetProvider{
    constructor() { super();}
    public static getWidgetView() {
        return HealthscoreWidgetSettingsComponent;
    }
}
