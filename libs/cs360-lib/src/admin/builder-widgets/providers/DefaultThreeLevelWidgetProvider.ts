import { DefaultThreeLevelWidgetBuilderComponent } from "../modules/default-three-level-widget/default-three-level-widget-builder/default-three-level-widget-builder.component";
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/csm';

// @dynamic
export class DefaultThreeLevelWidgetProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView() {
    return new Promise((resolve) => resolve(DefaultThreeLevelWidgetBuilderComponent));
  }
}

