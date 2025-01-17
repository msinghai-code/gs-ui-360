import { FieldConfig, FieldConfigProperties, FilterInfo } from "@gs/gdk/core";
import { FieldTreeNode, GSLookupObject } from '@gs/gdk/core/types';
import { LookSearchConfig } from "@gs/gdk/lookup-search/lookup-search.interfaces";
import { GSObject } from "@gs/gdk/core";

export interface INZCollapsePanel{
    active: boolean,
    disabled: boolean,
    name: string,
    sourceObjectName:string,
    sourceObjectTree:FieldTreeNode[] | any[],
    fieldTreeOptions:any,
    icon?: string,
    customStyle?: any
};
export interface ITreeData {
    obj: GSObject; 
    children: FieldTreeNode[] | any[];
}
export interface CTAFieldConfig extends FieldConfig{
    properties?: CTAFieldConfigProperties;
    sortOrder?: string;
    lookupDetail?: ILookupDetail;
    hasLookup?: boolean;
    readOnly?:boolean;
    sticky?:boolean;
    formulaField?:boolean;
    defaultValue?:string;
    /** Below properties are UI specific properties will not be present in BE and will be created in UI. */
    displayLabel?: string;
    options?:IPicklistOption[];
    href?:string;
    hasError?:boolean;
    lookupSearchOptions?:LookSearchConfig;
    showAsRow?:boolean;
    colSpan?:number;
    colOffset?:number;
    subscribeOnValueChange?:boolean;
    hidden?: boolean;
}

export interface CTAFieldConfigProperties extends FieldConfigProperties {
    uiTreeRootNode?:string;
    path?:string;
    currencyISOCode?:string;
    closeMandatory?:boolean;
    decimalPlaces?:number;
    displayField?:any;
    disabled?:boolean;
    validators?:{
        maxLength?:number,
        dateGreaterThanToday?:boolean;
        mandatory?:boolean;
    };
    autofocus?:boolean;
    showColor?:boolean;
    showTooltip?:boolean;
    filterObjectives?:boolean;
    searchFields?: CTAFieldConfig[];
    filterInfo?: FilterInfo;
}

export interface ILookupDetail{
    fieldDBName? : string,
    fieldName? : string,
    lookupId? : string,
    lookupName? : string,
    lookupObjects? : GSLookupObject[]
}

export interface IPicklistOption{
    gsid:string | boolean;
    name:string;
    active:boolean;
    selected?:boolean;
    color?:string;
    disabled?:boolean;
}

export interface ICockpitColumnPickerOptions {
    /*object tree to be shown in each collapsible section */
    objectNames: string[],
    /*object which is root, technically.
    if this is not given, fieldconfigs will be constructed,with  objectName as the root*/
    baseObjectName: string,
    /*map of objectname : fieldname, where fieldname is the lookup to uiTreerootnode from baseobject*/
    baseObjectFieldNames: {
      [key: string]: string
    },
    /** Levels to show in the field selection.*/ 
    levels : number
    /* array of selected fields, contains fields from all objects sent in objectNames prop.
    fieldConfig constructed with baseobject as the root */
    previousFields: CTAFieldConfig[],
    /* flag to show collapsible section */
    showCollapsibleSection: boolean,
    /* flag to show extra section preferrably standard section on top. */
    showExtraSection : boolean,
    /* additiocal section, where the fields are random i.e; not from an object */
    addCollapsibleSection?: {
      label: string,
      id: string,
      fields: {
        label: string,
        fieldName: string,
        [key: string]: any
      }[],
      previousFields: {
        label: string,
        fieldName: string,
        [key: string]: any
      }[]
    },
    selectablefunction?: (fld: any, key: string) => boolean
  }
