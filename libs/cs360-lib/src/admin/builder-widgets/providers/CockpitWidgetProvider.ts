import { CockpitDefaultSettingComponent } from "../modules/cockpit-widget/cockpit-default-setting/cockpit-default-setting.component";
import { CockpitWidgetComponent } from "../modules/cockpit-widget/cockpit-widget.component";
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/csm';


// @dynamic
export class CockpitWidgetProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView(type?: any) {
    return CockpitWidgetComponent
  }
}


export class CockpitWidgetSettingProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView() {
    return CockpitDefaultSettingComponent;
  }
}
