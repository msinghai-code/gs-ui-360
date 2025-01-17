
import { GSField } from "@gs/gdk/core";

export interface IReportFilterCondition {
    comparisonOperator: string;
    filterAlias: string;
    filterValue?: any;
    leftOperand: any;
    rightOperandType: string;
    locked?: boolean;
    filterField?: any;
    includeNulls?: boolean;
};

export interface IReportFilter {
    conditions?: IReportFilterCondition[];
    expression?: string;
};

export interface IReportAdditionalFilter {
    whereAdvanceFilter: IReportFilter;
    havingAdvanceFilter: IReportFilter;
}
export interface ISourceDetails {
    objectName?: string;
    objectLabel?: string;
    dataStoreType?: string;
    connectionId?: string;
    connectionType?: string;
}

export interface IReportMaster {
    reportId:string,
    reportName:string,
    reportDescription:string,
    sourceDetails:ISourceDetails
    showFields: Array<GSField>,
    drillDownFields: Array<any>,
    groupByFields: Array<GSField>,
    orderByFields: Array<any>,
    whereFilters: IReportFilter,
    havingFilters: IReportFilter,
    limit: number,
    pageSize: number,
    offset: number,
    reportDisplayType: string,
    reportOptions: any,
    reportType: string,
    reportTypes: string[];
    properties: any
}

