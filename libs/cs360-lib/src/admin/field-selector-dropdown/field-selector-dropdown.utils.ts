/***
 * created by rpal on 29 May 2021
 */

import { GSField } from "@gs/gdk/core";

export function getFieldWithMapping(field: GSField, mappingKey: string): boolean {
    return field
        && field.meta
        && field.meta.mappings
        && field.meta.mappings.GAINSIGHT
        && field.meta.mappings.GAINSIGHT.key.toUpperCase() === mappingKey;
}

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

export function allowDatatypesForFilters(primaryDatatype: string): string[] {
    switch (primaryDatatype) {
        case 'STRING':
            return ["STRING", "SFDCID", "REFERENCE", "LOOKUP", "GSID"];
        default:
            return null;
    }
}

export function isObjectTransactional(object: any): boolean {
    return object.transactional || false;
}
