/***
 * created by rpal on 29 May 2021
 */

import { GSField } from "@gs/gdk/core";


export function getFieldWithLookupToAccount(field: GSField): boolean {
    return field.dataType.toUpperCase() === "LOOKUP" &&
        field.meta &&
        field.meta.lookupDetail &&
        field.meta.lookupDetail.lookupObjects &&
        field.meta.lookupDetail.lookupObjects[0] &&
        field.meta.lookupDetail.lookupObjects[0].objectName.toUpperCase() === "ACCOUNT";
}

export function getIdFieldFromAccount(field: GSField): boolean {
    return field.fieldName === 'Id';
}

export function convertIFieldToIFieldInfo(field: GSField) {
    const { fieldName, dbName, dataType, label, objectName, objectDBName, objectLabel, fieldPath } = field;
    return {
        type: "BASE_FIELD",
        fieldName,
        dbName,
        dataType,
        label,
        objectName,
        objectDBName,
        objectLabel,
        fieldPath: null
    };
}

export function getFieldPath(field, path? : string){
    if(field.fieldPath) {
        const fieldLabel = field.fieldPath.right.fieldLabel || field.fieldPath.right.label;
        let pathLabel = path ? path + ' ➝ ' + fieldLabel : fieldLabel;
        return getFieldPath(field.fieldPath, pathLabel);
    } else {
        return path || "";
    }
}

export function isObjectTransactional(object: any): boolean {
    return object.transactional || false;
}
