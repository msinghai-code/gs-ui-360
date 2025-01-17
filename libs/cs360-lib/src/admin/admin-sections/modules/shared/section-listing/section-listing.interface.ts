import { GridsterItem } from "angular-gridster2";
import { SummaryWidget, WidgetCategoryType, FieldTreeViewOptions } from '@gs/cs360-lib/src/common';

export interface SectionCategory {
    label: string;
    id?: string;
    children: SummaryWidget[] | Section[] | any[];
    widgetType?: WidgetCategoryType;
    active?: boolean;
    isLoading?: boolean;
    treeOptions?: FieldTreeViewOptions | any;
    itemDefault?: any;
    widgetCategory?: string;
    dimensionDetails?: any;
}

export interface Section {
    sectionId: string;
    label: string;
    sectionType?: string;
    isDropped: boolean;
    multiplesAllowed: boolean;
    displayOrder: number;
    itemDefault?: {};
}

export interface SectionListOptions {
    title: string;
    description?: string;
    serverSideSearch?: boolean;
}

export interface SectionContainer extends GridsterItem {
    title?: string;
    type?: string;
    id: string;
    cols: number;
    rows: number;
    x: number;
    y: number;
    properties: any;
}
