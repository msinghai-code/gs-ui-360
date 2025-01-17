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
  hidden?: boolean;
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
  reportMaster: any;
  triggerReload?: boolean;
  globalFilter?: FilterInfo;
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
  globalFilter?: any;
}

export interface GridState {
  filters?: any,
  order?: any[]
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

export interface FilterValue {
  dateLiteral?: string;
  value: any;
  userLiteral?: string;
  currencyCode?: string;
  includeNulls?: boolean;
}

export interface FilterInfo {
  conditions: Array<FilterCondition | any>;
  expression: string;
}

export interface FilterCondition {
  filterAlias: string;
  filterValue?: FilterValue;
  filterField?: FieldConfig;
  leftOperand?: FieldConfig;
  logicalOperator?: string;
  rightOperandType?: string;
  comparisonOperator?: string;
  locked?: boolean;
  includeNulls?: boolean;
}

export interface FieldConfig {
  type: string;
  fieldName: string;
  label: string;
  dataType: string;
  objectName: string;
  objectLabel?: string;
  properties?: any;
  fieldPath?: FieldPath;
  displayOrder?: number;
  groupable?: boolean;
  sortable?: boolean;
  formulaField?: boolean;
  uniqueName?: string;
  value?: string;
  filterOutInWhere?: boolean;
  dbName?: string;
  objectDBName?: string;
}

export interface FieldPath {
  lookupId?: string;
  legacyLookupId?: string;
  lookupName: string;
  left: FieldPathResolvingProperties;
  right: FieldPathResolvingProperties;
  fieldPath: null | FieldPath;
  joinType: string;
}

export interface FieldPathResolvingProperties {
  type: string;
  fieldName: string;
  objectName: string;
}

export interface SourceDetails {
  objectName?: string;
  objectLabel?: string;
  dataStoreType?: string;
  connectionId?: string;
  connectionType?: string;
}
export interface ReportState {
  select: any[];
  group: any[];
  order: any[];
  drilldown?: any[];
  where: FilterInfo;
  having: FilterInfo;
  limit: number;
  offset: number;
  id: string;
  description: string;
  pageSize: number;
  reportType: string;
  reportTypes: string[];
  displayType: string;
  reportOptions: any;
  properties: any;
  name: string;
  sourceDetails: SourceDetails;
}

export interface ReportMaster {
  reportId: string;
  reportName: string;
  reportDescription: string;
  sourceDetails: SourceDetails;
  showFields: GSField[];
  drillDownFields: any[];
  groupByFields: GSField[];
  orderByFields: any[];
  whereFilters: FilterInfo;
  havingFilters: FilterInfo;
  limit: number;
  pageSize: number;
  offset: number;
  reportDisplayType: string;
  reportOptions: any;
  reportType: string;
  reportTypes: string[];
  properties: any;
}

export declare type type_token = 'aggregationFunction' | 'summarizedBy' | 'function' | 'field';
export declare type nulls_token = 'FIRST' | 'LAST';
export interface Expression {
  tokenType: type_token;
  key: string;
  outputDataType: string;
  arguments?: any[];
}
export interface ExpressionDetails {
  expressionType: type_token;
  expression: Expression;
}
export interface OrderByInfo {
  order: string;
  nulls: nulls_token;
}
export interface PortfolioGSField extends GSField {
  displayName?: string;
  displayOrder: number;
  sortable: boolean;
  filterable: boolean;
  columnWidth: number | string;
  objectDBName: string;
  dataLabels?: Array<{
    fieldAlias?: string;
    fieldLabel?: string;
  }>;
  rowGrouped: boolean;
  pivoted: boolean;
  fieldPath?: any;
  [key: string]: any;
  expressionDetails?: ExpressionDetails;
  sortOrder?: string;
  orderByInfo?: OrderByInfo;
  fieldType?: FieldType;
}

export type FieldType = "field" | "calculated" | "value";

export interface ReportViewerSettings {
  textWrap?: boolean;
  freezeFirstColumn?: boolean;
  cumulative?: boolean;
  enableComments?: boolean;
  enableDataLabels?: boolean;
  enableDualYAxis?: boolean;
  enableMilestone?: boolean;
  enableRGBColor?: boolean;
  enableTextWrap?: boolean;
  normalize?: boolean;
  showLabels?: boolean;
  maxValue?: number;
}
