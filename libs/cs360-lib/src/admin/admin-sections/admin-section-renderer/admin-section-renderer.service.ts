import { Injectable } from '@angular/core';
import { BaseAdminSectionRendererComponent } from '../base-admin-section-renderer/base-admin-section-renderer.component';
import { SummaryConfigurationComponent } from '../modules/summary-configuration/summary-configuration.component';
import { RegistrationService } from '@gs/cs360-lib/src/common';


@Injectable({ providedIn: 'root' })
export class AdminSectionRendererService {

    constructor(private rs: RegistrationService) {
    }

    getComponentClass(context, sectionType){
        if(this.rs.getElementTag("SECTION_ADMIN",context,sectionType)){
            return BaseAdminSectionRendererComponent;
        }else{
            switch (sectionType){
                case "SUMMARY":
                    return SummaryConfigurationComponent;
                default:
                    /**
                     * This will go to the fallback case and resolve
                     * the existing c/r360 admin sections using the
                     * provider approach
                      */
                    // console.error("All sections must have a sectionType");
                    return null;
            }
        }
    }

}
