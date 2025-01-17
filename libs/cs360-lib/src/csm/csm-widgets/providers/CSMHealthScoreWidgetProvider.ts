import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";
import { HealthScoreWidgetComponent } from '../modules/healthscore-widget/healthscore-widget.component';

// @dynamic
export class CSMHealthScoreWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView(type?: any) {
        return HealthScoreWidgetComponent;
    }
}