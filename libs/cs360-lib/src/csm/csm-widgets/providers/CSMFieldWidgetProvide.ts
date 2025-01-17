import { FieldWidgetComponent } from "../modules/field-widget/field-widget.component";
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";

// @dynamic
export class CSMFieldWidgetProvider extends AbstractWidgetProvider {
    constructor() { super();}
    public static getWidgetView() {
        return new Promise(resolve => resolve(FieldWidgetComponent));
    }
}
