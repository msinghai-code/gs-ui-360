import { ChartWidgetComponent } from "../modules/chart-widget/chart-widget.component";
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";

// @dynamic
export class CSMChartWidgetProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView(type?: any) {
    return ChartWidgetComponent;
  }
}