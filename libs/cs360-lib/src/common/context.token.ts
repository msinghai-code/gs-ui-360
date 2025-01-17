import { InjectionToken } from "@angular/core";
import { LayoutSharingType } from "./cs360.defaults";

export const CONTEXT_INFO = new InjectionToken('CONTEXT_INFO') as ICONTEXT_INFO;

export interface ICONTEXT_INFO {
    cId?: string;
    dId?: string;
    aId?: string;
    rId?: string;
    pId?: string;
    companyPersonGsid?:string;
    relationshipPersonGsid?:string;
    relationshipTypeId?: string;
    hideTimeline?: boolean;
    hideDetailView?: boolean;
    hideSally?: boolean;
    // pageContext?: 'C360' | 'R360' | 'ESC360' | 'ESR360'; // moved to generic
    sectionName?: string;
    sectionLabel?: string;
    isNativeWidget?: boolean;
    isSmartWidget?: boolean;
    height?: boolean;
    entityId?: string;
    companyName?: string;
    relationshipName?: string;
    error?: string;
    errorType?: string;
    isp?: boolean;
    entityContext?: string;

    // Web component inputs
    consumptionArea?: string;
    isCompact?: boolean;
    hidePinUpin?: boolean;
    cache?: {
        RESOLVE_LAYOUT: boolean;
        FEATURE_TOGGLE: boolean;
        [key: string]: boolean;
    };
    containerResizable?: boolean;
    // END - Web component inputs

    //generic context
    baseObject?: string;
    pageContext?: string;
    associatedContext?: string;
    associatedObjects?: any[];
    associatedObjectsEditMap?: {[key:string]: Array<string>}; // Set editability based on current assocaited context
    uniqueIdentifierFieldName?: string; // the id to be used in cache-service eg: companyId, relationshipId
    uniqueCtxId?: string;
    layoutResolveType?: string, // used in layout resolve payload
    entityType?: string, // used in layout resolve payload. value is same as baseObject in most scenarios
    typeId?: string;
    sharingType?: LayoutSharingType;
    layoutResolvePrependUrl?: string;
    sectionPrependUrl?: string;
    customProperties?: {[key:string]: any};
    attributeUrl?: string;
    previewConfig?: any;
    saveMultiAttributeurl?:string;
    appVariant?: string
    //END - generic
}

export interface StateAction360 {
    type: string;
    payload: any;
    saveState?: boolean;
}
