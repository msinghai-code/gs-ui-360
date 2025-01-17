import { find, findIndex, isUndefined, includes, cloneDeep } from "lodash";
import { MappingObjects } from './pojos/portfolio-enums';
import { PortfolioFieldTreeInfo, WidgetField } from './pojos/portfolio-interfaces';
import { PORTFOLIO_WIDGET_CONSTANTS, COMPANY_SOURCE_DETAILS, RELATIONSHIP_SOURCE_DETAILS } from './pojos/portfolio.constants';
import {EnvironmentService} from "@gs/gdk/services/environment";

export const NAVIGATION_PAGES = {
    REPORT_BUILDER : {
        beta :  'GSReports',
        legacySFDC : 'Reports',
        legacyNXT : 'Reports'
    },
    DASHBOARD : {
        beta :  'GSDashboard',
        legacySFDC : 'Home',
        legacyNXT : 'Home'
    },
    DASHBOARD_BUILDER : {
        beta : 'GSDashboardBuilder',
        legacySFDC : 'LayoutManager',
        legacyNXT : 'Dashboards'
    },
    CUSTOMERSUCCESS360 : {
        beta : "customersuccess360",
        legacySFDC : "customersuccess360",
        legacyNXT : "customersuccess360",
    },
    RELATIONSHIP360 : {
        beta : "relationship360",
        legacySFDC : "relationship360",
        legacyNXT : "relationship360",
    }
};

export function getFieldMeta(field: WidgetField, fieldTreeInfo: PortfolioFieldTreeInfo, baseObjectName: string, addLookupDetail = true): WidgetField {
    if(field.objectName === baseObjectName && !field.fieldPath) {
        const index = findIndex(fieldTreeInfo.fields, fmeta => fmeta.fieldName === field.fieldName);
        return {...fieldTreeInfo.fields[index]};
    } else {
        const parentFieldName =  field.fieldPath && field.fieldPath.right && field.fieldPath.right.fieldName;
        const fieldData = find(fieldTreeInfo.children, data => data.key === parentFieldName);
        const childField = find(fieldData.children, childField => childField.data.fieldName === field.fieldName);
        const childFieldData = cloneDeep(childField && {...childField.data});
        if(!childFieldData.meta.lookupDetail && addLookupDetail) {
            childFieldData.meta.lookupDetail = fieldData.data.meta.lookupDetail;
        }
        childFieldData.fieldPath = field.fieldPath;
        return childFieldData;
    }
}

export function isRelationshipEnabled(GS: any) {
    return isUndefined(GS.isRelationshipEnabled) ? true : GS.isRelationshipEnabled;
}

export function getSourceDetails(objectName: string) {
    return objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME ? COMPANY_SOURCE_DETAILS : RELATIONSHIP_SOURCE_DETAILS;
}

export function isFieldEditDisabled(field: WidgetField, baseObjectName: string) {
    let editDisabled = field.meta && !field.meta.updateable;
    switch(true) {
        case field.meta && (field.meta.formulaField || field.meta.fieldGroupType === 'SYSTEM'):
            // system fields and formula fields
            editDisabled = true;
            break; 
        case field.fieldPath && includes(PORTFOLIO_WIDGET_CONSTANTS.LOOKUP_NON_EDITABLE_FIELDS, field.fieldPath.lookupId.toUpperCase()):
            // 1st level fields of createdby, modifiedby
            editDisabled = true;
            break; 
        case baseObjectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME:
        case baseObjectName === PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME:
            if(field.fieldPath && field.fieldName.toUpperCase() !== "NAME") {
                // for relationship only 0 level fields are editable.
                // We provide lookup via name fields of 1st level fields hence they are editable.
                editDisabled = true;
            }
            if( field.fieldPath &&
                includes(PORTFOLIO_WIDGET_CONSTANTS.LOOKUP_EDITABLE_FIELDS_USER, field.dataType) && 
                includes(PORTFOLIO_WIDGET_CONSTANTS.USER_FIELDS, getLookupObject(field))) {
                // For User Fields, email is also editable
                editDisabled = false;
            }
            if(baseObjectName === PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME) {
                if(field.fieldName.toUpperCase() === PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_TYPEID_FIELD_NAME) {
                    // Blocking Relationship Type Edit
                    editDisabled = true;
                }
                if( field.fieldPath && field.fieldName.toUpperCase() === "NAME" &&
                    (field.objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME || 
                    field.objectName === PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_TYPEID_OBJECT_NAME)) { 
                    // Blocking TypeId Name and CompanyId Name
                    editDisabled = true
                }
            }
            break;
    }
    return editDisabled;
}

export function getLookupObject(field: WidgetField) {
    let objectName: string;
    if(field && field.meta) {
      if(field.meta.lookupDetail && field.meta.lookupDetail.lookupObjects[0]) {
        objectName = field.meta.lookupDetail && field.meta.lookupDetail.lookupObjects[0] && field.meta.lookupDetail.lookupObjects[0].objectName;
      } else {
        objectName = field.meta.mappings && field.meta.mappings.GAINSIGHT && MappingObjects[field.meta.mappings.GAINSIGHT.key];
      }
    }
    return objectName;
}

export function isLookupField(field) {
    if(field.fieldPath && field.fieldName === "Name") {
        return true;
    }
    const lookupObject = getLookupObject(field);
    if( field.fieldPath &&
        includes(PORTFOLIO_WIDGET_CONSTANTS.LOOKUP_EDITABLE_FIELDS_USER, field.dataType) && 
        lookupObject &&
        includes(PORTFOLIO_WIDGET_CONSTANTS.USER_FIELDS, lookupObject)) {
        return true;
    }
}

export function getFieldId(field: WidgetField, fieldPath?: any) {
    const path = fieldPath ? fieldPath : field;
    if(path.fieldPath) {
        return path.fieldPath.right.fieldName;
    } else {
        return field.fieldName;
    }
}

export function getUrlValidator(control) {
    if(!control.value) {
        return null;
    }
    return /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.%]+$/.test(control.value) ? null : { 'url': true };
};

export function getPageName(env: EnvironmentService, pageAlias: string, packageNS:string = '', revampEnabled = false) {
    if (env.isGainsight) {
        return revampEnabled ? NAVIGATION_PAGES[pageAlias].legacyNXT : NAVIGATION_PAGES[pageAlias].beta;
    } else {
        const pageName = revampEnabled ? NAVIGATION_PAGES[pageAlias].legacySFDC : NAVIGATION_PAGES[pageAlias].beta
        return `/apex/${packageNS}${pageName}`;
    }
}
