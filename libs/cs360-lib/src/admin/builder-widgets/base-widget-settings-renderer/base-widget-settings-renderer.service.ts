import { Injectable } from '@angular/core';
import { RegistrationService } from '@gs/cs360-lib/src/common';
import { TextWidgetSettingsComponent } from "../modules/text-widget/text-widget-settings/text-widget-settings.component";
import {
    BaseWidgetSettingsRendererComponent
} from "./base-widget-settings-renderer.component";


@Injectable({ providedIn: 'root' })
export class BaseWidgetSettingsRendererService {

    constructor(private rs: RegistrationService) {
    }

    getComponentClass(context, sectionType){
        if(this.rs.getElementTag("WIDGET_ADMIN",context,sectionType)){
            return BaseWidgetSettingsRendererComponent;
        }else{
            switch (sectionType){
                case "TEXT":
                    return TextWidgetSettingsComponent;
                default:
                    /**
                     * This will go to the fallback case and resolve
                     * the existing c/r360 widget settings component using the
                     * provider approach
                      */
                    return null;
            }
        }
    }

    getComponentWidth(context, sectionType){
        return this.rs.getWidgetSettingsWidth(context,sectionType);
    }

}
