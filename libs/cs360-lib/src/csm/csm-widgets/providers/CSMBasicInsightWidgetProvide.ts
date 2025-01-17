import { BasicInsightsWidgetComponent } from "../modules/basic-insights-widget/basic-insights-widget.component";
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";

// @dynamic
export class CSMBasicInsightWidgetProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView(type?: any) {
    return BasicInsightsWidgetComponent;
  }
}
