/**
 * created by rpal on 31 may 2021
 */

import {isEmpty} from 'lodash';
import {IReportGroup} from "@gs/report/reports-configuration/report-grouper/report-grouper";
import { PageContext,Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';

export function isObjectTransactional(group: IReportGroup) {
    return !isEmpty(group) ? !!group.collectionDetails.transactional: false;
}

type ADD_RECORD_PROPS = {
    objectId?: string,
    isStandardObject?: boolean,
    recordTypeId?: string,
    actualObjectId?: string,
    objectName?: string,
    data: Array<{
        fieldId?: string,
        value: string,
        label?: string,
        fieldName?: string,
        dataType ?: string
    }>,
    returnURL?: string,
    keyPrefix?: string,
    hasRecordTypes: boolean
};

type ADD_RECORD_PROPS_LIGHTNING = {
    operation?: string,
    sObject?: string,
    recordTypeId?: string,
    recordId?: string,
    accId?: string,
    accountLookupField?: string,
    rId?: string,
    relationshipLookupFieldName?: string,
    GS?: any
}

const accIdMap = {
    "case": "def_account_id",
    "event": "what_id",
    "task": "what_id",
    "accountcontactrole": "parentId",
    "order": "aid"
}

export function getCreateRecordUrl_lightning(props: ADD_RECORD_PROPS_LIGHTNING) {
    let url = "";
    url = `/apex/${getKey(props.GS, "ExportChurnAlertsDashbord")}?operation=${props.operation}`;


    if((["PREVIEW", "EDIT"] as any).includes(props.operation)) {
        return  (url += "&recordId="+props.recordId);
    }
    
    if(props.sObject) {
        url += `&sObject=${props.sObject}`;
    }
    
    if (props.accId) {
        url += `&accId=${props.accId}&accountLookupField=${props.accountLookupField}`;
    }

    if (props.recordTypeId) {
        url += `&recordTypeId=${props.recordTypeId}`;
    }

    if (props.relationshipLookupFieldName) {
        url += `&relationshipLookupFieldName=${props.relationshipLookupFieldName}&rId=${props.rId}`;
    }
    return url;
}

export function getCreateRecordUrl_classic(props: ADD_RECORD_PROPS) {
    let navigateUrl = `${props.keyPrefix || ""}/e?`;
    let hasRecordTypeUrl = "";
    if (props.hasRecordTypes) {
        hasRecordTypeUrl = `setup/ui/recordtypeselect.jsp/?ent=${props.isStandardObject ? props.objectName : props.actualObjectId}&save_new_url=`;
    }


    if (props.isStandardObject) {
        let paramsString = "";
        let standardObjURL = "";

        if(props.data.length === 1){
            standardObjURL = navigateUrl + (accIdMap[props.objectName.toLowerCase()] || "accid") + "=" + props.data[0].value;
        }

        let newURL = false;

        if(props.data.length) {
            let paramsMap = {};
            props.data.forEach(item => {

                if(item.fieldId && item.fieldId.toLowerCase() === "accid") {
                    //This is for reporting V3, we are hardcoding what we are passing
                    paramsMap[accIdMap[props.objectName.toLowerCase()] || "accid"] = props.data[0].value;
                    
                } else {
                    newURL = true;
                    
                    if(item.fieldName && item.fieldName.toUpperCase() === "ACCOUNTID") {
                        paramsMap[accIdMap[props.objectName.toLowerCase()] || "accid"] = item.value;
                    } else {

                        if(item.value && item.fieldId) {
                            if(item.dataType && item.dataType.toUpperCase() === "LOOKUP") {
                                paramsMap['CF'+item.fieldId] = item.value;
                                paramsMap['CF'+item.fieldId+'_lkid'] = item.value;
                            } else {
                                paramsMap[item.fieldId] = item.value;
                            }
                        }
                    }
                }
            });

            if(newURL) {
                standardObjURL = navigateUrl + objectToQueryParams(paramsMap);
            }
        }
        

        if (props.returnURL) {
            standardObjURL = standardObjURL + `&retURL=${window["encodeURIComponent"](props.returnURL)}`;
        }

        if (hasRecordTypeUrl) {
            return (hasRecordTypeUrl + window["encodeURIComponent"]("/" + standardObjURL));
        }

        return standardObjURL;
    }


    let paramsString = "";
    props.data.forEach(item => {
        if(item.fieldName && item.fieldName.toUpperCase() === "ACCOUNTID") {
            paramsString += '&'+(accIdMap[props.objectName.toLowerCase()] || "accid") + "=" + props.data[0].value;
        } else {
            paramsString += `&CF${item.fieldId}=${item.value}&CF${item.fieldId}_lkid=${item.value}`;
        }
    });


    let recordTypeParam = "";

    if (props.recordTypeId && !props.hasRecordTypes) {
        recordTypeParam = `&RecordType=${props.recordTypeId}`;
    }

    let returnUrlParam = "";
    if (props.returnURL) {
        returnUrlParam = `&retURL=${props.returnURL}`;
    }

    return hasRecordTypeUrl + navigateUrl + paramsString + recordTypeParam + returnUrlParam;
}

export function getKey(GS: any = {}, key?: any) {
    return (GS.packageNS || "") + key;
};

function objectToQueryParams(obj) {
    let result = [];
    for(let k in obj) {
        if(obj[k] != null) {
            result.push(k + '=' + obj[k]);
        }
    }
    return result.join("&");
}


/**
 * Checks if the provided context represents a Customer360 (C360) page.
 * 
 * @param ctx The context object to be checked.
 * @returns A boolean value indicating whether the provided context represents a C360 page.
 */
export function isC360(ctx: any): boolean {
    return ctx.pageContext === PageContext.C360;
}

/**
 * Retrieves the Mini360 context from the provided context object.
 * 
 * @param ctx The context object from which to extract Mini360 context.
 * @returns An object containing Mini360 context with properties 'appVariant', 'entityName', and 'entityId',
 *          or an empty object if Mini360 context is not found or the provided context is invalid.
 */
export function getReporting360Ctx(ctx: any): { appVariant: string, entityName: string, entityId: string, entityAid: string } | {} {
    // If context is not provided, it's not a Mini360 context, return an empty object
    if (!ctx) {
        return {};
    }

    const reporting360Context: { appVariant: string, entityName: string, entityId: string, entityAid: string } = {
        appVariant: ctx.appVariant,
        entityName: '',
        entityId: '',
        entityAid: ''
    };

    if (Cs360ContextUtils.isR360(ctx)) {
        reporting360Context.entityName = ctx.relationshipName;
        reporting360Context.entityId = ctx.rId;
    }
    else if (isC360(ctx)) {
        reporting360Context.entityName = ctx.companyName;
        reporting360Context.entityId = ctx.cId || ctx.entityId;
        reporting360Context.entityAid = ctx.aId;
    }

    return reporting360Context;
}
