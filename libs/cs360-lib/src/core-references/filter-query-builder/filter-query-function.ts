import {cloneDeep, find, isEmpty, max, uniq} from "lodash";
import { AutoSuggestDetails } from "@gs/gdk/filter/builder";
import { DEFAULT_LOOKUP_SELECT_FIELDS } from "@gs/gdk/core";
import { FilterTreeField } from "@gs/report/pojos";
import { IFieldMeta } from "../core-interfaces";

export function getFieldSearchController(field: FilterTreeField) {
    const meta: IFieldMeta = !isEmpty(field.data.meta) ? field.data.meta : {};
    if (!isEmpty(meta.properties) && meta.properties.SEARCH_CONTROLLER) {
        return meta.properties.SEARCH_CONTROLLER;
    }
}


export function getFieldSearchDetails(field: FilterTreeField) {
    const searchController = getFieldSearchController(field);
    if(searchController === 'AUTO_SUGGEST') {
        const {meta} = field.data;
        return meta.properties.autoSuggestDetails ?
          meta.properties.autoSuggestDetails :
          getSearchFields(meta);
    } else {
        return {};
    }
}

export function getSearchFields(meta) {
    const columnsToList = ['Gsid', 'Name'];
    const searchOn = meta.lookupDetail.fieldName.toLowerCase() === "gsid" ? ["Gsid"] : [meta.lookupDetail.fieldName];
    const lookupOnWhichField = meta.lookupDetail.fieldName;
    if (columnsToList.indexOf(lookupOnWhichField) === -1) {
      columnsToList.push(lookupOnWhichField);
    }
  
    return {
      columnsToList,
      searchOn,
      object: getObjectName(meta)
  
    };
  }

export function getObjectName(meta) {
return (meta.lookupDetail && meta.lookupDetail.lookupObjects &&
    meta.lookupDetail.lookupObjects.length && meta.lookupDetail.lookupObjects[0].objectName);
}

export function getFieldSourceType(field: FilterTreeField) {
    const {meta} = field.data;
    // This will return field actual valuetype
    return meta.properties.sourceType;
}

export function formLookupSearchPayload({field, selectFields = cloneDeep(DEFAULT_LOOKUP_SELECT_FIELDS), searchFields, value, operator}) {
    const {data, dataStore, source} = field as any;
    const searchDetails: AutoSuggestDetails = getFieldSearchDetails(field);
    const lookupOnWhichField = !!data.meta.lookupDetail ? data.meta.lookupDetail.fieldName  : getLookupOnFieldForAutoSuggest(field);
    if (!!lookupOnWhichField && selectFields.indexOf(lookupOnWhichField) === -1) {
        selectFields.push(lookupOnWhichField);
    }
    if (searchDetails && !!searchDetails.columnsToList && searchDetails.columnsToList.length) {
        selectFields = uniq(selectFields.concat(searchDetails.columnsToList));
    }
    // Add searchOn field to select field list. They will also be fetch alongside columnToList.
    if (searchDetails && !!searchDetails.searchOn && searchDetails.searchOn.length) {
        selectFields = uniq(selectFields.concat(searchDetails.searchOn));
    }
    const objectName = searchDetails.object || getObjectName(data.meta);
    if (!objectName) {
      return null;
    }
    return {
        "selectFields": selectFields,
        "searchFields": searchFields.length ? searchFields : searchDetails.searchOn,
        "value": value,
        "operator": operator,
        "object": objectName,
        "source": searchDetails.connectionType || source || "MDA",
        "dataStore": searchDetails.dataStore || dataStore || "HAPOSTGRES",
        "connectionId": searchDetails.connectionId || "MDA",
        "useDBName": false
    };
}

export function getLookupOnFieldForAutoSuggest(field: FilterTreeField): string {
    const sourceType: string = getFieldSourceType(field);
    const autoSuggestDetail = getFieldSearchDetails(field) || {};
    switch (sourceType.toUpperCase()) {
        case 'GSID':
            return 'Gsid';
        case 'REFERENCE':
        case 'SFDCID':
            if (autoSuggestDetail.columnsToList && autoSuggestDetail.columnsToList.length) {
              if (autoSuggestDetail.columnsToList.includes('Id')) {
                return 'Id';
              } else {
                return autoSuggestDetail.columnsToList[0];
              }
            }
          return 'Id'
        case 'ID':
            return 'Id';
        case 'EMAIL':
            return 'Email';
        default:
            if (autoSuggestDetail.columnsToList && autoSuggestDetail.columnsToList.length) {
              if (autoSuggestDetail.columnsToList.includes('Name')) {
                return 'Name';
              } else {
                return autoSuggestDetail.columnsToList[0];
              }
            }
            return 'Name';
    }
}