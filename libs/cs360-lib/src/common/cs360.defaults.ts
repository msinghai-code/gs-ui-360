import {cloneDeep} from 'lodash';


export enum FormatOptionTypes {
    NUMBER = "NUMBER",
    PERCENTAGE = "PERCENTAGE",
    FINANCIAL = "FINANCIAL",
    CURRENCY = "CURRENCY"
}

export enum LayoutSharingType {
    INTERNAL = "internal",
    EXTERNAL = "external"
}

export const DEFAULT_RTA_WIDTH = 4;

const FormatOptions = [
    { value: FormatOptionTypes.NUMBER, label: "360.admin.formatOptions.number"},
    { value: FormatOptionTypes.PERCENTAGE, label: "360.admin.formatOptions.percent"},
    { value: FormatOptionTypes.FINANCIAL, label: "360.admin.formatOptions.financial"},
    { value: FormatOptionTypes.CURRENCY, label: "360.admin.formatOptions.currency"}
];

export const FieldFormatOptions = (dataType?: string) => {
    if(dataType && dataType === DataTypes.CURRENCY) {
        return cloneDeep(FormatOptions.filter(opt => opt.value !== "PERCENTAGE"));
    }
    return cloneDeep(FormatOptions);
}

export const NumericSummarizationOptions = [
    {value: "DEFAULT", label: "360.admin.numeric_summerization.default", description: '360.admin.numeric_summerization.defaultDesc'},
    {value: "K", label: "360.admin.numeric_summerization.thousands", description: '360.admin.numeric_summerization.thousandsDesc'},
    {value: "M", label: "360.admin.numeric_summerization.millions", description: '360.admin.numeric_summerization.millionsDesc'},
    {value: "B", label: "360.admin.numeric_summerization.billions", description: '360.admin.numeric_summerization.billionsDesc'}
]

export const AggregationOptions = [
    {value: "SUM", label: "360.admin.aggregation_options.sum"},
    {value: "AVG", label: "360.admin.aggregation_options.avg"},
    {value: "MAX", label: "360.admin.aggregation_options.max"},
    {value: "MIN", label: "360.admin.aggregation_options.min"}
]

export enum DataTypes {
    SFDCID = "SFDCID",
    PICKLIST = "PICKLIST",
    EMAIL = "EMAIL",
    LOOKUP = "LOOKUP",
    PERCENTAGE = "PERCENTAGE",
    CURRENCY = "CURRENCY",
    GSID = "GSID",
    IMAGE = "IMAGE",
    RICHTEXTAREA = "RICHTEXTAREA",
    MULTISELECTDROPDOWNLIST = "MULTISELECTDROPDOWNLIST",
    JSON = "JSON",
    JSONSTRING = "JSONSTRING",
    JSONNUMBER = "JSONNUMBER",
    JSONBOOLEAN = "JSONBOOLEAN",
    WHOID = "WHOID",
    WHATID = "WHATID",
    CONTEXT = "CONTEXT",
    URL = "URL",
    DATE = "DATE",
    DATETIME = "DATETIME",
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN"
}
