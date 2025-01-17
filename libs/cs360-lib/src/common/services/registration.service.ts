import {Inject, Injectable} from "@angular/core";
import {IS_LEGACY_BROWSER} from "@gs/gdk/utils/common";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { APP_VARIANT } from "@gs/gdk/directives";

export type CategoryTypes = "WIDGET" | "WIDGET_ADMIN" | "SECTION" | "SECTION_ADMIN" | "QUICK_ACTIONS";


@Injectable({
    providedIn: 'root'
})

export class RegistrationService {
    private SECTION_ADMIN = () => ({
        C360:{
            "PERSON" :{
                elementTag:"gs-people-c360-admin",
                autonomousModule: "people-c360-admin"
            },
            "USAGE":{
                elementTag: "ae-360-section-configuration",
                autonomousModule: "ae-cs360"
            }
        },
        R360:{
            "USAGE":{
                elementTag: "ae-360-section-configuration",
                autonomousModule: "ae-cs360"
            },
            "PERSON" :{
                elementTag:"gs-people-c360-admin",
                autonomousModule: "people-c360-admin"
            }
        },
        P360: {
            "PEOPLE_MAPS" :{
                elementTag:"gs-people-c360-admin",
                autonomousModule: "people-c360-admin"
            },
            "USAGE":{
              elementTag: "ae-360-section-configuration",
              autonomousModule: "ae-cs360"
            }
        }
    });
    private SECTION = (consumptionArea?:string,appVariant?:string) => ({
        C360:{
            "PERSON": {
                elementTag: consumptionArea === 'zoom' ? "gs-360-people-zoom" : appVariant === APP_VARIANT.MINI_360 ? "gs-people-section-widget" : "gs-people-section",
                autonomousModule: consumptionArea === 'zoom' ? "people-zoom" : appVariant === APP_VARIANT.MINI_360 ? "people-section-widget" : "people-section",
                subModule: ""
            },
             "USAGE":{
                elementTag: "ae-360-section",
                autonomousModule: "ae-cs360"
            },
            "ATTACHMENTS":{
                elementTag: "gs-attachments-csm-list",
                autonomousModule: "attachments-csm"
            }
        },
        R360:{
            "PERSON": {
                elementTag: consumptionArea === 'zoom' ? "gs-360-people-zoom" : appVariant === APP_VARIANT.MINI_360 ? "gs-people-section-widget" : "gs-people-section",
                autonomousModule: consumptionArea === 'zoom' ? "people-zoom" : appVariant === APP_VARIANT.MINI_360 ? "people-section-widget" : "people-section",
                subModule: ""
            },
             "USAGE":{
                elementTag: "ae-360-section",
                autonomousModule: "ae-cs360"
            },
            "ATTACHMENTS":{
                elementTag: "gs-attachments-csm-list",
                autonomousModule: "attachments-csm"
            }
        },
        P360: {
            "PEOPLE_MAPS" :{
                elementTag:"gs-people-map-widget",
                autonomousModule: "people-map-widget",
                subModule: ""
            },
            
            "TIMELINE":{
                elementTag:"gs-timeline-p360-element",
                autonomousModule: "timeline-p360-wrapper",
                subModule: ""
            },
             "USAGE":{
                elementTag: "ae-360-section",
                autonomousModule: "ae-cs360"
            },
            "CX_CENTER": {
                elementTag: "gs-cx-p360-section",
                autonomousModule: "cx-widgets",
                subModule: "person"
            }
        }
    });
    private WIDGET = () => ({
        "C360":{
            "COMMUNITY_METRICS": {
                elementTag: "gs-x-product-360-widget",
                autonomousModule: "x-product-widget",
                subModule: ""
            },
            "CE_LEARNERS_METRICS": {
                elementTag: "gs-x-product-360-widget",
                autonomousModule: "x-product-widget",
                subModule: ""
            }
        },
        "P360":{
            "SPONSOR_TRACKING": {
                elementTag:"gs-sponsor-tracking-widget",
                autonomousModule: "people-widgets-csm",
                subModule: ""
            },
            "KEY_ATTRIBUTES": {
                elementTag:"gs-key-attributes-360-widget",
                autonomousModule: "people-widgets-csm",
                subModule: ""
            },
            "RELATIONSHIP_ASSOCIATED": {
                elementTag:"gs-rp-association-widget",
                autonomousModule: "people-widgets-csm",
                subModule: ""
            },
            "COMPANY_ASSOCIATED": {
                elementTag:"gs-cp-association-widget",
                autonomousModule: "people-widgets-csm",
                subModule: ""
            },
            "COMMUNITY_METRICS": {
                elementTag: "gs-x-product-360-widget",
                autonomousModule: "x-product-widget",
                subModule: ""
            },
            "CE_LEARNERS_METRICS": {
                elementTag: "gs-x-product-360-widget",
                autonomousModule: "x-product-widget",
                subModule: ""
            },
            "LAST_5_COMMUNITY_ACTIVITY": {
                elementTag: "gs-x-product-360-widget",
                autonomousModule: "x-product-widget",
                subModule: ""
            },
            "TIMELINE":{
                elementTag:"gs-timeline-p360-element",
                autonomousModule: "timeline-p360-wrapper",
                subModule: ""
            },
            "TOP_5_FEATURES_USED": {
                elementTag: "gs-x-product-360-widget",
                autonomousModule: "x-product-widget",
                subModule: ""
            },
            "OVER_ALL_PRODUCT_USAGE": {
                elementTag: "gs-x-product-360-widget",
                autonomousModule: "x-product-widget",
                subModule: ""
            },
            "LEAST_5_FEATURES_USED": {
                elementTag: "gs-x-product-360-widget",
                autonomousModule: "x-product-widget",
                subModule: ""
            },
            "SURVEY_NPS_WIDGET": {
                elementTag: "gs-nps-p360-widget",
                autonomousModule: "survey-response",
                subModule: "p360"
            },
            "SURVEY_CSAT_WIDGET": {
                elementTag: "gs-csat-p360-widget",
                autonomousModule: "survey-response",
                subModule: "p360"
            },
            "PROGRAMS_WIDGET": {
                elementTag: "gs-person-programs-widget",
                autonomousModule: "person-programs-widget",
                subModule: ""
            }
        },
        "R360": {
            "COMMUNITY_METRICS": {
                elementTag: "gs-x-product-360-widget",
                autonomousModule: "x-product-widget",
                subModule: ""
            }
        }
    });
    private WIDGET_ADMIN = () => ({
        "C360":{
        },
        "P360":{
            "KEY_ATTRIBUTES": {
                elementTag:"gs-key-attributes-360-configuration",
                autonomousModule: "people-widgets-admin",
                subModule: ""
            }

        }
    });
    private QUICK_ACTIONS = (consumptionArea?:string,appVariant?:string) => ({
        "C360":{
            "PERSON": {
                elementTag: appVariant === APP_VARIANT.MINI_360 ? "gs-add-person-widget" : "gs-add-person",
                autonomousModule: appVariant === APP_VARIANT.MINI_360 ? "people-section-widget" : "people-section"
            },
            "ATTACHMENTS":{
                elementTag: "gs-attachments-csm-upload",
                autonomousModule: "attachments-csm"
            }
        },
        "R360":{
            "PERSON": {
                elementTag: appVariant === APP_VARIANT.MINI_360 ? "gs-add-person-widget" : "gs-add-person",
                autonomousModule: appVariant === APP_VARIANT.MINI_360 ? "people-section-widget" : "people-section"
            },
            "ATTACHMENTS":{
                elementTag: "gs-attachments-csm-upload",
                autonomousModule: "attachments-csm"
            }
        },
        "P360":{
            "SUMMARY": {
                elementTag:"gs-person-email",
                autonomousModule: "people-widgets-csm"
            },
            "TIMELINE":{
                elementTag:"gs-timeline-p360-element",
                autonomousModule: "timeline-p360-wrapper",
                subModule: ""
            }
        }
    });
    constructor(@Inject("envService") public env: EnvironmentService){

    }
    public registerAdminSectionsAndWidgets(adminRegistry){
        // this.SECTION_ADMIN = ...;
        // this.WIDGET_ADMIN = ...;
    }
    public registerCsmSectionsAndWidgets(csmRegistry){
        // this.SECTION = ...;
        // this.WIDGET = ...;
    }
    public getElementTag(category:CategoryTypes,context, type,consumptionArea?:string,appVariant?:string) : string{
        return this[category]()[context] && this[category]()[context][type] &&
        this[category]()[context][type]['elementTag'] ? this[category](consumptionArea,appVariant)[context][type]['elementTag'] : "";
    }
    public getAutonomousModule(category:CategoryTypes,context, type,consumptionArea?:string,appVariant?:string): string{
        return this[category]()[context] && this[category]()[context][type] &&
        this[category]()[context][type]['autonomousModule'] ? this[category](consumptionArea,appVariant)[context][type]['autonomousModule'] : "";
    }

    public getSubModule(category:CategoryTypes,context, type) : string{
        return this[category]()[context] && this[category]()[context][type] &&
        this[category]()[context][type]['subModule'] ? this[category]()[context][type]['subModule'] : "";
    }

    public getModuleUrl(category, pageContext, type,consumptionArea?:string,appVariant?:string): string{
        const autonomousModule = this.getAutonomousModule(category, pageContext, type,consumptionArea,appVariant);
        const subModule = this.getSubModule(category, pageContext, type);
        // this.url = "https://localhost:4200/main.js";
        const autonomousUrl = this.env.gsObject.autonomousUrls[autonomousModule];
        const moduleUrl = subModule ? autonomousUrl.includes('localhost') ? autonomousUrl : `${autonomousUrl}/${subModule}` : autonomousUrl;
        /**
         * Serve the autonomous sections/widgets locally
         * In native.index.mock.js - GS.autonomousUrls - update the autonomousModule key
         * with the localhost path ("people-c360-admin": "https://localhost:4200/main.js")
          */
        return moduleUrl.includes('localhost') ? moduleUrl : `${moduleUrl}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
    }

    public getWidgetSettingsWidth(context, type) {
        const category = "WIDGET_ADMIN";
        return this[category]()[context] && this[category]()[context][type] &&
        this[category]()[context][type]['width'] ? this[category]()[context][type]['width'] : "30%";
    }
}
