import { WidgetProperties} from "@gs/gdk/widget-viewer";

export interface ISummaryNumberInterface {
    value?: number;
    finalValue?: string;
    prefix?: string;
    suffix?: string;
    trend?: {name?: string; color?: string};
    color?: string;
}

export interface IVisualizationValues {
    label: string;
    value: number | string;
    color: string;
    tooltip?: string;
    [prop: string]: any;
}

export interface ISummaryVisualizationLabelInterface {
    finalValue ?:string;
    value ?: number;
    suffix ?: string;
    color ?: string;
    label ?: string;
}

export interface ISummaryVisualizationInterface {
    type?: string;
    values?: IVisualizationValues[];
    message?: string;
    sum: ISummaryVisualizationLabelInterface;
}

export interface ISummaryAttributeData extends ISummaryNumberInterface  {
    id?: string;
    name?: string;
    label?: string;
    message?: string;
    errorCode?: string;
    errorDesc?: string;
    visualization?: ISummaryVisualizationInterface;
    properties?:any;
}

export interface ISummaryAttribute {
    id?: string;
    name?: string;
    label?: string;
    data?: ISummaryAttributeData;
    type?: string;
    sortOrder?: number;
    displayName?: string;
    categoryId?: string;
    attributeId?: string;
    attributeCategory?: string;
    selected?:boolean; // Strictly UI needs; to be trimmed on save
    baseWidth?:number; // Strictly UI
    filterMappings?:any;
}

export interface ISummaryGroups {
    groupName: string;
    attributesList: ISummaryAttribute[];
    sortOrder?: number;
    baseWidth?:number; // Strictly UI
    data?:ISummaryAttributeData;
    selected?:boolean; // Strictly UI needs; to be trimmed on save
}

export interface SummaryWidgetProperties extends WidgetProperties{
    summaryAttributeGroups:ISummaryGroups[];
}

export interface IKPISearchConfiguration {
    [property: string]: object;
}

export interface IKPIPayloadConfig {
    pageNumber: number;
    pageSize: number;
    limit: number;
    fields: any[],
    searchConfiguration: IKPISearchConfiguration;
}


export const SummaryKPIConstants = {
    gridOptions : {
        autoResizeColumnsToFit: true,
        frameworkComponents: {},
        pagination: false,
        rowSelection: 'single',
        suppressMultiRangeSelection: false,
        suppressRowClickSelection: true
    },
    gridAdditionalOptions: {
        serverSort: true,
        serverSearch: true,
        noDataMessage: '',
        state: { sort: [] },
        allowMultiSelect: false,
        showCustomPagination: true,
        customPaginator: {
            recordType: "",
            pageSizes: [
                13
            ],
            toRecord: null,
            fromRecord: 0,
            totalRecords: 0,
            currentPageNum: 0
        }
    },
    KpiColumnDefs : [
        {
            field : 'name',
            colId : 'name',
            headerName : 'Report ',
            width: 100,
            sortable: true,
            menuTabs : [],
            sortingOrder: ['asc', 'desc'],
            cellRenderer: 'radioCellRenderer',
            tooltipValueGetter: (params) => params.value
        },
        {
            field : 'company',
            colId : 'company',
            headerName : 'Company ID ',
            width: 100,
            sortable: true,
            menuTabs : [],
            sortingOrder: ['asc', 'desc'],
            cellRenderer: 'selectCellRenderer'
        },
        {
            field : 'relationship',
            colId : 'relationship',
            headerName : 'Relationship ID',
            width: 100,
            sortable: true,
            menuTabs : [],
            sortingOrder: ['asc', 'desc'],
            cellRenderer: 'selectCellRenderer'
        },
        {
            field : 'createdBy',
            colId : 'createdBy',
            headerName : 'Created By',
            width: 100,
            sortable: true,
            menuTabs : [],
            sortingOrder: ['asc', 'desc']
        }
    ],
    KpiPayloadConfig: {
        pageNumber: 1,
        pageSize: 13,
        limit: 13,
        fields: [
            {
                "fieldName": "name",
                "label": "Name",
                "dataType": "STRING"
            },
            {
                "fieldName": "createdBy",
                "label": "Created By",
                "dataType": "STRING"
            },
            {
                "fieldName": "filterMappingLookupFields",
                "label": "filterMappingLookupFields",
                "meta": {
                    "hidden": false,
                    "sortable": true
                },
                "dataType": "STRING",
                "isSearched": true
            },
            {
                "fieldName": "sourceObjectName",
                "label": "Source Object Name",
                "meta": {
                    "hidden": false,
                    "sortable": true
                },
                "dataType": "STRING",
                "isSearched": true
            }
        ],
        searchConfiguration: {
            visualizationType: {"value":["KPI"],"operator":"EQ"}
        }
    }
};

export const DEFAULT_SUMMARY_RIBBON_ATTRIBUTE_GROUP_CONSTANTS = {
    headerLabel : "Maximum 12 attributes can be added or distributed into maximum five groups.",
    defaultGroupLabel: 'Untitled',
    attributesCount: {
        minAllowedGroupsCount: 3,
        maxAllowedGroupsCount: 5,
        minAllowedAttributesCount : 10,
        maxAllowedAttributesCount: 12,
        mergeAttributeGroupsWarning: 'Merging additional group attributes to the third group, if attributes Count is More than 10.'
    }
};


export const default_summary_ribbon_groups : ISummaryGroups[]  = [
    {
        "groupName": "Company",
        "attributesList": [
            {
                "displayName": "Companies",
                "attributeId": "Summary_Companies",
                "attributeCategory": "Company",
                "type": "attribute",
                "sortOrder": 0
            },
            {
                "displayName": "Distribution by Health",
                "attributeId": "Health_Score",
                "attributeCategory": "Scorecard",
                "type": "attribute",
                "sortOrder": 1
            },
            {
                "displayName": "ARR",
                "attributeId": "Summary_ARR",
                "attributeCategory": "Company",
                "type": "attribute",
                "sortOrder": 2
            }
        ],
        "sortOrder": 0
    },
    {
        "groupName": "Customer Experience",
        "attributesList": [
            {
                "displayName": "CSAT",
                "attributeId": "CX_CSAT_SUMMARY",
                "attributeCategory": "Survey",
                "type": "attribute",
                "sortOrder": 0
            },
            {
                "displayName": "NPS",
                "attributeId": "CX_NPS_SUMMARY",
                "attributeCategory": "Survey",
                "type": "attribute",
                "sortOrder": 1
            },
            {
                "displayName": "Sentiment",
                "attributeId": "CX_SENTIMENT_SUMMARY",
                "attributeCategory": "Survey",
                "type": "attribute",
                "sortOrder": 2
            }
        ],
        "sortOrder": 1
    },
    {
        "groupName": "Cockpit",
        "attributesList": [
            {
                "displayName": "Due this week",
                "attributeId": "Summary_CTAS_DUE_THIS_WEEK",
                "attributeCategory": "Cockpit",
                "type": "attribute",
                "sortOrder": 0
            },
            {
                "displayName": "Overdue CTA's",
                "attributeId": "Summary_OVERDUE_CTAS",
                "attributeCategory": "Cockpit",
                "type": "attribute",
                "sortOrder": 1
            },
            {
                "displayName": "Open CTAs",
                "attributeId": "Summary_OPEN_CTAS",
                "attributeCategory": "Cockpit",
                "type": "attribute",
                "sortOrder": 2
            }
        ],
        "sortOrder": 2
    }
];
