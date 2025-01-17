import { Injectable } from '@angular/core';
import { RegistrationService } from '@gs/cs360-lib/src/common';
import { TextWidgetComponent } from "../modules/text-widget/text-widget.component";
import {
    BaseWidgetRendererComponent
} from "./base-widget-renderer.component";

@Injectable({
  providedIn: 'root'
})
export class BaseWidgetRendererService {

  constructor(private rs: RegistrationService) {
  }

  getComponentClass(context, sectionType){
      if(this.rs.getElementTag("WIDGET_ADMIN",context,sectionType)){
          return BaseWidgetRendererComponent;
      }else{
          switch (sectionType){
              case "TEXT":
                  return TextWidgetComponent;
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
}
