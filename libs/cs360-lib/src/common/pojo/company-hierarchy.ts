import { GALAXY_ROUTE } from './../cs360.constants';
import {GSGlobalFilter} from "@gs/gdk/filter/global/core/global-filter.interface";
import { DataTypes } from './../cs360.defaults';
import { CustomizedField, FieldConfigurationOptions } from "../modules/field-configuration/field-configuration";
import {FieldTreeNode} from "@gs/gdk/core/types";

export const CSM_API_URLS = {
    FETCH_DATA: (companyId) => `${GALAXY_ROUTE}/cr360/data/section`
}

export const FieldSaveProperties = [
    "aggregateFunction",
    "dataType",
    "displayOrder",
    "description",
    "fieldName",
    "fieldPath",
    "formatOptions",
    "label",
    "objectLabel",
    "objectName",
    "fieldPath",
    "properties",
    "scale",
    "lookupDisplayField",
]

//{360.admin.company_hierarchy_drop_text}=Drop any text, date or number field
//{360.admin.company_hierarchy_drop_currency}=Drop any Currency or Current Score field
export const ChartViewFields = [
    {allowedDerivedDataTypes: ["NAME"], info: "360.admin.company_hierarchy_drop_text"},
    {allowedDerivedDataTypes: [], allowAllTypes: true, info: ""},
    {allowedDerivedDataTypes: [], allowAllTypes: true, info: ""},
    {allowedDerivedDataTypes: [DataTypes.CURRENCY, "CURRENTSCORE"], info: "360.admin.company_hierarchy_drop_currency"},
    {allowedDerivedDataTypes: [DataTypes.CURRENCY, "CURRENTSCORE"], info: "360.admin.company_hierarchy_drop_currency"}
]
//{360.admin.company_hierarchy_labels_list}=list
//{360.admin.company_hierarchy_labels_chart}=chart
export const CompanyHierarchyViewLabels  = {
    LIST: "list",
    CHART: "chart"
}
export const CompanyHierarchySectionViewLabels  = {
    LIST: '360.admin.company_hierarchy_labels_list',
    CHART: '360.admin.company_hierarchy_labels_chart'
}
export interface CompanyHierarchyColumn extends CustomizedField {
    displayOrder?: number;
    allowedDataTypes?: string[];
    info?: string;
    type?: string;
    sampleData?: string;
    hide?: boolean;
    derivedColDatatype?: string;
    properties?: any;
    customizable?: boolean;
    showLabelInput?: boolean;
    tempLabel?: string;
    hoverLabel?: string;
    path?: string;
    rootNode?: FieldTreeNode;
}

export interface ViewInfo {
    label: string;
    title: string;
    fieldsLimit: number;
    fields: CompanyHierarchyColumn[];
    fieldConfigOptions: FieldConfigurationOptions;
    sectionlabel: string;
}

export interface CompanyHierarchyConfig {
    [key: string]: CompanyHierarchyColumn[];
}
// 360.admin.company_hierarchy.list = List
// 360.admin.company_hierarchy.chart = Chart
export const InitialViewInfos: ViewInfo[] = [
    {
        label: CompanyHierarchyViewLabels.LIST, title: "360.admin.company_hierarchy.list", fieldsLimit: 20, fields: [], sectionlabel:CompanyHierarchySectionViewLabels.LIST,
        fieldConfigOptions: {
            showRollup: true,
            showAggregationType: true,
            showType: true,
            showDecimals: true,
            showNumericSummarization: true,
            showDescription: true,
            showEditable: false,
            showLookupDisplayField: true
        }
    },
    {
        label: CompanyHierarchyViewLabels.CHART, title: "360.admin.company_hierarchy.chart", fieldsLimit: 5, fields: [],sectionlabel:CompanyHierarchySectionViewLabels.CHART,
        fieldConfigOptions: {
            showType: true,
            showDecimals: true,
            showNumericSummarization: true,
            showDescription: true,
            showEditable: false,
            showLookupDisplayField: true
        }
    }
]

export interface CompanyHierarchyState {
    state:any;
    whereClause: GSGlobalFilter;
    sectionId: string;
}

export const InitialHierarchyState = (state, sectionId, whereClause?) => {
    return {
        state: state,
        whereClause: whereClause || {},
        sectionId
    } as CompanyHierarchyState;
}
// {360.admin.company_hierarchy.invalid_filter} = Invalid filter condition(s). Try again.
// {360.admin.company_hierarchy.not_configured} = View not configured
// {360.admin.company_hierarchy.circular_records_error} = One or more companies are themselves marked as their own parent companies. Hierarchy cannot be displayed unless these companies are updated to reflect their correct parent companies.

export const COMPANY_HIERARCHY_MESSAGES = {
    INVALID_FILTER_CONDITION: "360.admin.company_hierarchy.invalid_filter",
    NOT_CONFIGURED: "360.admin.company_hierarchy.not_configured",
    CIRCULAR_RECORDS_ERROR: "360.admin.company_hierarchy.circular_records_error"
}
// {360.admin.company_hierarchy.company_name} = Company Name
// {360.admin.company_hierarchy.company} = Company
// {360.admin.company_hierarchy.Company} = company
// {360.admin.company_hierarchy.field_name} = Name
// {360.admin.company_hierarchy.ge_power} =GE Power
export const NameField = {
    fieldName: "Name",
    sampleData: "360.admin.company_hierarchy.ge_power",
    label: "360.admin.company_hierarchy.company_name",
    dataType: "STRING",
    derivedColDatatype: "NAME",
    objectName: "company",
    objectLabel: "360.admin.company_hierarchy.company",
    properties: {chartFieldIndex: 0, sortable: true}
};
