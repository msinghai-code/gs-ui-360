import { CommunityWidgetCsmComponent } from "../modules/community-widget/community-widget-csm.component";
import { AbstractWidgetProvider } from "./CSMAbstractWidgetProvider";

// @dynamic
export class CommunityWidgetProvider extends AbstractWidgetProvider {
    constructor() { super(); }
    public static getWidgetView() {
        return CommunityWidgetCsmComponent;
    }
}
