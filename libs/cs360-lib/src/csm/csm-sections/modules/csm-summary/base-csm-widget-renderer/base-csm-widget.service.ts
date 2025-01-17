import { Injectable } from '@angular/core';

import { BaseCsmWidgetRendererComponent } from './base-csm-widget-renderer.component';
import { RegistrationService } from '@gs/cs360-lib/src/common';


@Injectable({ providedIn: 'root' })
export class BaseCsmWidgetRendererService {
    constructor(private rs: RegistrationService) {
    }
    getComponentClass(context,widgetType:string){
        return this.rs.getElementTag("WIDGET",context, widgetType) ? BaseCsmWidgetRendererComponent : null;
    } 

}
