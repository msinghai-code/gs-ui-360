// import { IReportFilter, IReportMaster } from '@gs/core';
import { ReportFilter, ReportMaster } from "@gs/report/pojos";
import { GSField } from "@gs/gdk/core";
import { PortfolioWidgetGSField } from '../portfolio-widget-grid/PortfolioWidgetGSField';
import { PortfolioRoleTypes, PortfolioScopes } from './portfolio-enums';

export interface Field {
  fieldName: string;
  dbName: string;
  label: string;
  dataType: string;
  objectName: string;
  objectDBName: string;
  objectLabel: string;
  meta: FieldMeta;
}

export interface FieldMeta {
  properties: any;
  accessible: boolean;
  filterable: boolean;
  sortable: boolean;
  groupable: boolean;
  createable: boolean;
  updateable: boolean;
  externalId: boolean;
  formulaField: boolean;
  hasLookup: boolean;
  required: boolean;
  richText: boolean;
  nillable: boolean;
  readOnly: boolean;
  dependentPicklist: boolean;
  fieldGroupType: any;
  selfLookup: boolean;
  indexed: boolean;
  decimalPlaces: number;
  originalDataType: string;
  valueType: any;
  defaultValue: any;
  hidden: boolean;
  deleted: boolean;
  nameField: boolean;
  aggregatable: boolean;
}

export interface WidgetField extends GSField {
  selected?: boolean;
  editable?: boolean;
  deletable?: boolean;
  lookupDisplayField?: GSField;
  displayName?: string;
  disabled?: boolean;
  value?: any;
  editDisabled?: boolean;
  displayOrder?: number;
  isSaving?: boolean;
  openPopup?:boolean;
  searching?:boolean;
  lookupSearchOption?: any;
}

export interface PortfolioFieldTreeMap {
  relationship: PortfolioFieldTreeInfo;
  company: PortfolioFieldTreeInfo;
}

export interface PortfolioFieldTreeInfo {
  fields: WidgetField[];
  children: any[];
  selectedFields?: WidgetField[];
}

export interface PortfolioGridActionInfo {
  action: string;
  info?: any;
}

export interface PortfolioGridInfo {
  data: any;
  reportMaster: ReportMaster;
  triggerReload?: boolean;
  globalFilter?: ReportFilter;
  noRowsOverlayComponentParams?: {title: string; message: string};
}

export interface PortfolioEditRequestInfo {
  portfolioId : string;
  gsids : string[];
  fieldDetails : any;
}

export interface FieldEditorValueChangeInfo {
  valid?: boolean;
  [key: string] : InlineEditData | any;
}

export interface InlineEditData {
  fv: any;
  k: any;
  v?: any;
}

export interface PortfolioGridState {
  portfolioId: string;
  offset: number;
  pageSize: number;
  orderByFields: PortfolioWidgetGSField[]
  whereFilters: any[];
  globalFilter?: ReportFilter;
}

export interface PortfolioObjectConfiguration {
  orderByFields: PortfolioWidgetGSField[];
  showFields: PortfolioWidgetGSField[];
  showTab: boolean;
  whereFilter: any[];
}

export interface PortfolioConfig {
  configuration: {
    company: PortfolioObjectConfiguration; 
    relationship: PortfolioObjectConfiguration;
  };
  deleted: boolean;
  pageSize: number;
  portfolioId: string;
  portfolioAdminId?: string;
  portfolioName: string;
  portfolioScope: PortfolioScopes;
  roleType: PortfolioRoleTypes;
  error?: any;
}

export interface IFilterable {
  getSourceDetails() : any
  isFilterable() : boolean
  onFilterUpdate(globalFilter?: any):void
}

export interface PortfolioAdminWidgetSettingsAction {
  type: string;
  data: any;
}
