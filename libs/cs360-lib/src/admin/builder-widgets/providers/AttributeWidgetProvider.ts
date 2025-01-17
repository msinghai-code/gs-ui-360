
import { AttributeWidgetBuilderComponent } from "../modules/attribute-widget/attribute-widget-builder/attribute-widget-builder.component";
import { AttributeWidgetSettingComponent } from "../modules/attribute-widget/attribute-widget-setting/attribute-widget-setting.component";
import { FieldWidgetSettingComponent } from "../modules/field-widget/field-widget-setting/field-widget-setting.component";
import { FieldWidgetComponent } from "../modules/field-widget/field-widget.component";
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/csm';

// @dynamic
export class AttributeWidgetProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView() {
    return new Promise((resolve) => resolve(AttributeWidgetBuilderComponent));
  }
}

export class AttributeWidgetSettingProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView() {
    return AttributeWidgetSettingComponent
  }
}



export class FieldWidgetSettingProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView() {
    return FieldWidgetSettingComponent
  }
}


export class FieldWidgetProvider extends AbstractWidgetProvider {
  constructor() { super(); }
  public static getWidgetView() {
    return FieldWidgetComponent;
  }
}


