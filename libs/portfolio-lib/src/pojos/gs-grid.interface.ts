import {GridOptions} from "@ag-grid-community/core";

export interface IAGBaseGridColumn {
  colId?: string; // The unique ID to give the column.
  field: string; // The field of the row to get the cells data from (if colId is not given the ID will default to the field)
  headerName: string; // 	The name to render in the column header
  headerClass?: string; // class to use for the header cell
  width?: number; // width of the column
  filter?: string | boolean; // Set to true to use the default filter.
  filterFramework?: any; // Filter component to use for this column
  filterParams?: any; // custom parameters for the filter
  hide?: boolean; // if it is true, hides the column from displaying
  cellEditor?: string; // custom template for column on edit mode
  cellEditorFramework?: any; // custom component for editing cell
  cellEditorParams?: any;
  cellRenderer?: any; // custom template for column
  cellRendererFramework?: any;  // custom component for rendering cell data
  cellRendererParams?: any;
  valueFormatter?: any; // custom formatter for displaying the data
  valueGetter?: any; // gets the column data
  cellClass?: string; // styles for cell
  editable?: boolean; // whether column is editable or not
  lockPosition?: boolean; // to freeze the column
  pinned?: string; // to set the position of the column
  formatOptions?: ColumnDataFormatOptions;
  sortable?: boolean; // whether the column is sortable
  sort?: string; // set the sort model to ascending or descending
  rowGroup?: boolean; // rowgrouping based on a specified column
  type?: string;
  enableRowGroup?: boolean;
  encoded?: boolean;
  menuTabs?: any;
  [key: string]: any;
  stopRowSelection?: boolean; // prevents row selection on cell click
  uniqueIdentifier?: any;
  sortingOrder?: Array<string>;
  suppressSizeToFit?:boolean;
}

export interface IAGGridColumn extends IAGBaseGridColumn {
  meta?: any;
}

// DefaultConfiguration applies for all the columns, column configuration overrides the defaulkt configuration
export interface IAGDefaultColDef {
  sortable?: boolean;
  sort?: string;
  suppressMenu?: boolean;
  minWidth?: number;
  headerCheckboxSelectionFilteredOnly?: boolean;
  resizable?: boolean;
  filter?: boolean;
  editable?: boolean;
  mode?: any;
}

// @ts-ignore
export interface IAGBaseGridConfig extends GridOptions {
  floatingFilter?: boolean; // to show filters
  suppressColumnMoveAnimation?: boolean;
  columnDefs?: IAGGridColumn[];
  defaultColDef?: IAGDefaultColDef;
  pagination?: boolean;
  paginationPageSize?: number;
  suppressContextMenu?: boolean;
}


export interface IAGGridConfig extends IAGBaseGridConfig {
  editType?: string;
  multiColumnHeader?: boolean;
  rowSelection?: string;
  autoResizeColumnsToFit?: boolean;
  recordType?: string; // for showing item label while moving items to folders
  sort?: any[];
  lockPinned? :boolean;
  getRowNodeId?: any;
}

export interface ColumnDataFormatOptions {
  prefix?: string;
  suffix?: string;
  date?: string;
  currency?: string;
  locale?: any;
}
