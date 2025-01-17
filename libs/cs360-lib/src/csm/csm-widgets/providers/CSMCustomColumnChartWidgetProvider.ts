import { CustomColumnChartWidgetComponent } from "../modules/custom-column-chart-widget/custom-column-chart-widget.component";
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";

// @dynamic
export class CSMCustomColumnChartWidgetProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView(type?: any) {
    return CustomColumnChartWidgetComponent;
  }
}