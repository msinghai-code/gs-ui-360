import { Injectable } from '@angular/core';
import { BaseCsmSectionRendererComponent } from '../base-csm-section-renderer/base-csm-section-renderer.component';
import { CsmSummaryComponent } from "../modules/csm-summary/csm-summary.component";

import { RegistrationService } from '@gs/cs360-lib/src/common';
import {
    BaseQuickActionSectionRendererComponent
} from "../../quick-actions/base-quick-action-section-renderer/base-quick-action-section-renderer.component";
import {CsmReportsComponent} from "../modules/csm-reports/csm-reports.component";


@Injectable({ providedIn: 'root' })
export class CsmSectionRendererService {
    constructor(private rs: RegistrationService) {
    }

    getComponentClass(context:string, sectionType:string){
        if(this.rs.getElementTag("SECTION",context,sectionType)){
            return BaseCsmSectionRendererComponent;
        }else{
            switch (sectionType){
                case "SUMMARY":
                    return CsmSummaryComponent;
                case "RELATED_LIST":
                    return CsmReportsComponent;
                default:
                    /**
                     * This will go to the fallback case and resolve
                     * the existing c/r360 sections using the
                     * provider approach
                     */
                    // console.error("All sections must have a sectionType");
                    return null;
            }
        }
    }

    getQuickActionComponentClass(context:string, quickActionType:string){
        if(this.rs.getElementTag("QUICK_ACTIONS",context,quickActionType)){
            return BaseQuickActionSectionRendererComponent;
        }else{
            switch (quickActionType){
                default:
                    /**
                     * This will go to the fallback case and resolve
                     * the existing c/r360 sections using the
                     * provider approach
                     */
                    return null;
            }
        }
    }

}
