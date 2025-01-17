// import { buildFieldPath, FieldPath } from '@gs/core';
import { buildFieldPath } from "@gs/gdk/utils/field";
import { GSField, FieldPath } from "@gs/gdk/core";
import { CTAFieldConfig, ILookupDetail } from './column-picker.interface';
import { cloneDeep } from "lodash";

// gets the uniqueName based on fieldConfig - which is used to identify the tree node
export function getUniqueNameFromCTAFieldConfig(fieldConfig:CTAFieldConfig){
    let uniqueName = "";
    let fieldPath =  fieldConfig.fieldPath ?  {...fieldConfig.fieldPath} : fieldConfig.fieldPath;
    while(fieldPath){
        uniqueName = uniqueName + fieldPath.right.objectName + "$" + fieldPath.right.fieldName + "$"
        fieldPath = fieldPath.fieldPath;
    }

    if(fieldConfig.lookupDetail){
        uniqueName = uniqueName + fieldConfig.objectName + "$" + fieldConfig.fieldName +
        "$" + fieldConfig.lookupDetail.lookupObjects[0].objectName;

    }else {
        uniqueName = uniqueName + fieldConfig.objectName + "$" + fieldConfig.fieldName;
    }

    return uniqueName;
}

export function isLookUpfield(field:GSField):boolean{
    return field && field.meta.hasLookup === true && field.meta.lookupDetail &&
        field.meta.lookupDetail.lookupObjects &&
        field.meta.lookupDetail.lookupObjects.length > 0;
}

export function isLookUpfieldFromFieldConfig(fieldConfig:CTAFieldConfig):boolean{
    return fieldConfig.hasLookup && fieldConfig.lookupDetail.lookupObjects.length > 0;
}

export function getLookupObjectName(field:GSField):string{
    if(field && this.isLookUpfield(field)){
        return field.meta.lookupDetail.lookupObjects[0].objectName;
    }
}

export function getRootObjectNameFromCTAFieldConfig(fieldConfig:CTAFieldConfig){
    return fieldConfig.fieldPath 
        ? (fieldConfig.fieldPath && fieldConfig.fieldPath.right && fieldConfig.fieldPath.right.objectName)
        :  fieldConfig.objectName;
}

export function getLookupField(lookingInfo:ILookupDetail):string{

    return lookingInfo && lookingInfo.fieldName;
}

export function addParentFieldPathToFields(fieldConfig:CTAFieldConfig, uiRootNodeObjectName:string, parentFieldInfo:GSField){            
        const fielPath = {
            "lookupName": parentFieldInfo.meta.lookupDetail.lookupName,
            "lookupId": parentFieldInfo.meta.lookupDetail.lookupId,
            "left": {
                "fieldName": getLookupField(parentFieldInfo.meta.lookupDetail),
                "objectName": uiRootNodeObjectName,
                "type": "BASE_FIELD"
            },
            "right": {
                "fieldName": parentFieldInfo.fieldName,
                "objectName": parentFieldInfo.objectName,
                "type": "BASE_FIELD"
            },
            "fieldPath": fieldConfig.fieldPath || null,
            "joinType": "LEFT_JOIN"
        };

        fieldConfig.fieldPath = fielPath;
        fieldConfig.properties = fieldConfig.properties || {};
        
        //// uiTreeRootNode is tree root node in ui, required by UI
        fieldConfig.properties.uiTreeRootNode = uiRootNodeObjectName;
    }
export function getFieldByFieldName(fields:GSField[], fieldName:string):GSField{
    return fields.find(item => item.fieldName === fieldName);
}

export function getNoOfLevels(fieldPath:FieldPath):number{

    let levels = 0;
    fieldPath = fieldPath ? cloneDeep(fieldPath): null;
    while(fieldPath){
        levels ++ ;
        fieldPath = fieldPath.fieldPath;
    }
    return levels;
}

export function isUpdatable(fieldInfo:GSField,fieldConfig:CTAFieldConfig, source:string):boolean{
    if(source === "SFDC"){
        return fieldInfo.meta.updateable;
    }else{
        const levels = getNoOfLevels(fieldConfig.fieldPath);
        if(levels === 0){
            const isUpdatableFld = fieldInfo.meta.updateable;
            const fieldGroupType =    fieldInfo.meta.fieldGroupType;
            const isSystemOrStandardField = (fieldGroupType === "SYSTEM" || fieldGroupType === "STANDARD");
            return (fieldConfig.fieldName === "CurrencyIsoCode") ? true : 
                ((isUpdatableFld && !isSystemOrStandardField) || fieldInfo.dataType.toUpperCase() === "RICHTEXTAREA");
        }
        else{
            return false;
        }
    }
}

export function isDAPicklist(fieldConfig){
    return fieldConfig.properties.PICKLIST_OBJECT
        && fieldConfig.properties.PICKLIST_OBJECT.toLowerCase() === 'da_picklist';
}

export function convertFieldToFieldPath(fieldInfo: GSField, updateFieldPath:boolean = true){
    let fldConfig:CTAFieldConfig = null;
    const { dataType, fieldName, currencyCode, 
        objectName, objectLabel, 
        label, formulaField, meta } = fieldInfo;
    const { groupable, sortable, decimalPlaces, 
        readOnly, hasLookup, lookupDetail,
        nillable, updateable, properties, length }  = meta as any;
    fldConfig = {
        type: 'COLUMN',
        label, dataType, fieldName,
        objectName, objectLabel, hasLookup,
        formulaField,groupable,sortable,
        properties : {
            ...properties,
            updateable,decimalPlaces,
            currencyISOCode: currencyCode,
            validators : {
                maxLength: length,
                mandatory: !nillable
            }
        },
        lookupDetail,
        fieldPath: hasLookup && updateFieldPath ? buildFieldPath([{data:fieldInfo, source: "", label, type: "BASE_FIELD", dataType, dataStore:""}] as any) : null
    }
    return fldConfig;
}