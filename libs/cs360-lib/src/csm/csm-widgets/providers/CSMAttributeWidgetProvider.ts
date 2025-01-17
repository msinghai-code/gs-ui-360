import { AttributeWidgetCsmComponent } from "../modules/attribute-widget/attribute-widget-csm/attribute-widget-csm.component";
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";

// @dynamic
export class AttributeWidgetProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView() {
    return new Promise((resolve) => resolve(AttributeWidgetCsmComponent));
  }
}
