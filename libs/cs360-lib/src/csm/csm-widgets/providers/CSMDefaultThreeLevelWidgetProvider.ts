import { DefaultThreeLevelWidgetCsmComponent } from "../modules/default-three-level-widget/default-three-level-widget-csm.component";
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";

// @dynamic
export class DefaultThreeLevelWidgetProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView() {
        return new Promise((resolve) => resolve(DefaultThreeLevelWidgetCsmComponent));
  }
}

