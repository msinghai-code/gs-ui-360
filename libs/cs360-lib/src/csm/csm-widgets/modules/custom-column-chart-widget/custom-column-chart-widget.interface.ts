export interface CustomColumnChartDataItem {
    color?: string;
    [key: string]: any;
}

export interface CustomColumnChartOptions {
    data: CustomColumnChartDataItem[] | any[];
    labelProp: string;
    legends?: string[];
    valueProps: string[];
    colors?: string[];
    maxDataPoint: number;
    spacing: string;
    groupItemSpacing?: string;
    colWidth: string;

    [key: string]: any;
}