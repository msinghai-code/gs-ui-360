
export interface WidgetCategory {
  label: string;
  widgetCategory: WidgetCategoryType;
  children?: SummaryWidget[];
  widgets?: SummaryWidget[];
  axisDetails?: AxisDetail;
  dimensionDetails?: DimensionDetails;
  mini360Dimensions?: DimensionDetails;
  treeOptions?: any;
  isLoading?: boolean;
  active?: boolean;
}

export enum WidgetCategoryType {
  STANDARD = 'Standard',
  FIELD = 'Field',
  REPORT = 'Report',
  KPI = 'KPI Widget',
}
//{360.admin.tooltip.standard}=Standard
//{360.admin.tooltip.field}=Field
//{360.admin.tooltip.report}=Report
//{360.admin.tooltip.kpi_widget}=KPI Widget
export enum WidgetCategorytooltipType {
  STANDARD = '360.admin.tooltip.standard',
  FIELD = '360.admin.tooltip.field',
  REPORT = '360.admin.tooltip.report',
  KPI = '360.admin.tooltip.kpi_widget',
}

export interface AxisDetail {
  x: number;
  y: number;
}

export interface DimensionDetails {
  cols?: number;
  rows?: number;
  maxItemCols?: number;
  maxItemRows?: number;
  minItemCols?: number;
  minItemRows?: number;
}

export interface SummaryWidget {
  properties?: any;
  widgetCategory?: WidgetCategoryType;
  widgetType: WidgetItemType;
  subType: WidgetItemSubType;

  label: string;
  tempLabel?: string;
  displayName?: string;
  className?: string;
  multiplesAllowed?: boolean;
  axisDetails?: AxisDetail;
  dimensionDetails?: DimensionDetails;
  mini360Dimensions?: DimensionDetails;
  configurable?: boolean;
  removable?: boolean;
  config?: any;
  itemId?: string;
  isDropped?: boolean;

  fieldName: string;
  category: WidgetItemCategory;
  reportId?: string;
  reportName?: string;
  isLoading?: boolean;

  cols?: number;
  rows?: number;
  maxItemCols?: number;
  maxItemRows?: number;
  minItemCols?: number;
  minItemRows?: number;
  x?: number;
  y?: number;

  [key: string]: any
}


export enum WidgetItemType {
  CR = 'CR',
  SCORECARD = "SCORECARD",
  COCKPIT = "COCKPIT",
  CASE = "CASE",
  TIMELINE = "TIMELINE",
  SP = "SP",
  CX_CENTER = "CX_CENTER",
  CSAT = "CSAT",
  NPS = "NPS",
  CI = "CI",
  REPORT = 'REPORT',
  LEADS = 'LEADS',
  COMMUNITY_METRICS = 'COMMUNITY_METRICS',
  CE_LEARNERS_METRICS = 'CE_LEARNERS_METRICS',
  CUSTOMER_HIGHLIGHTS = 'CUSTOMER_HIGHLIGHTS'
}

export enum WidgetItemSubType {
  CUSTOMER_JOURNEY = 'CUSTOMER_JOURNEY',
  HEALTH_SCORE_METRIC = 'HEALTH_SCORE_METRIC',
  HEALTH_SCORE_METRIC_AND_HISTORY = 'HEALTH_SCORE_METRIC_AND_HISTORY',
  IMAGE = 'IMAGE',
  SUCCESS_PLAN = 'SUCCESS_PLAN',
  REPORT = 'REPORT',
  DEFAULT = 'DEFAULT',
  FIELD = 'FIELD',
  ATTRIBUTE = 'ATTRIBUTES',
  MULTI_OBJECT_ATTRIBUTE = 'MULTI_OBJECT_ATTRIBUTE',
  TEXT = 'TEXT',
  THREE_LEVEL_WIDGET = 'THREE_LEVEL_WIDGET',
  ARR = 'ARR',
  MRR = 'MRR',
  CSM = 'CSM',
  RENEWAL_DATE = 'RENEWAL_DATE',
  CASE = 'CASE',
  ORIGINAL_CONTRACT_DATE = 'ORIGINAL_CONTRACT_DATE',
  SP = 'SP',
  ASP = 'ASP',
  COCKPIT = 'COCKPIT',
  COCKPIT_CTA = 'COCKPIT_CTA',
  BASE_INSIGHT_WIDGET = 'BASE_INSIGHT',
  CSAT = "CSAT",
  NPS = "NPS",
  TIMELINE = "TIMELINE",
  COMPANY_INTELLIGENCE = "CI",
  LEADS = 'LEADS',
  COMMUNITY_METRICS = 'COMMUNITY_METRICS',
  CE_LEARNERS_METRICS = 'CE_LEARNERS_METRICS',
  CUSTOMER_HIGHLIGHTS = 'CUSTOMER_HIGHLIGHTS',
  AVATAR_CONTENT = 'AVATAR_CONTENT',
  LIST = 'LIST',
  ARR_WITH_HISTORY = 'ARR_WITH_HISTORY'
}

export enum WidgetItemCategory {
  THREE_LEVEL_WIDGET = 'THREE_LEVEL_WIDGET'
}
