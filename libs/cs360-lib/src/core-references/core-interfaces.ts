export interface ILookupObject {
    dbName?: string;
    id?: string;
    label?: string;
    objectName?: string;
    objectLabel?: string;
    hasLookup?: boolean;
}

export interface IFieldMeta {
    accessible?: boolean;
    createable?: boolean;
    decimalPlaces?: number;
    dependentPicklist?: boolean;
    controllerName?: string;
    defaultValue?: string;
    fieldGroupType?: string;
    filterable?: boolean;
    formulaField?: boolean;
    groupable?: boolean;
    hasLookup?: boolean;
    indexed?: boolean;
    nillable?: boolean;
    originalDataType?: string;
    readOnly?: boolean;
    required?: boolean;
    richText?: boolean;
    selfLookup?: boolean;
    sortable?: boolean;
    updateable?: boolean;
    length?: number;
    mappings?: {
        GAINSIGHT?: {
            key?: string;
            dataType?: string;
        },
        SFDC?: {
          key?: string;
          dataType?: string;
        }
    };
    lookupDetail?: {
        fieldDBName?: string;
        fieldName?: string;
        fieldLabel?: string;
        lookupId?: string;
        lookupName?: string;
        lookupObjects: ILookupObject[]
    };
    properties?: {
        SEARCH_CONTROLLER?: string;
        CURRENCY_CODE?: string;
        CURRENCY_NAME?: string;
        CURRENCY_SYMBOL?: string;
        CURRENCY_UNICODE?: string;
        sourceType?: string;
        autoSuggestDetails?: any;
        RESTRICT_FILTER_LITERALS?: boolean;
        PICKLIST_CATEGORY_ID?: string;
        TYPE?:string;
    };
}
