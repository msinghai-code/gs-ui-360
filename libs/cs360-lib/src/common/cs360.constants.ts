import { CompactType, DisplayGrid, GridType } from "angular-gridster2";
import { GRIDSTER_DEFAULTS } from '@gs/gdk/widget-viewer';
import { GridsterConfig } from 'angular-gridster2';

export enum PageContext {
  C360 = "C360",
  R360 = "R360",
  ESC360 = "ESC360",
  ESR360 = "ESR360",
  P360 = "P360",
  SPACES = "SPACES",
  MINI_C360 = "MINI_C360"
}

export const MiniPrefix = 'mini_';

export enum ObjectNames {
  RELATIONSHIP = "relationship",
  COMPANY = "company",
  USER = "gsuser",
  SCORECARD_MASTER = "scorecard_master",
  SCORING_SCHEME_DEFINITION = "scoring_scheme_definition",
  PERSON = "person"
}

export enum ContextToEntityNameMapping {
  C360 = "COMPANY",
  R360 = "RELATIONSHIP",
}

//{360.csm.objectNames_relationship = relationship}
//{360.csm.objectNames_company = company}
//{360.csm.objectNames_user = gsuser}

export enum TranslatedObjectNames {
    RELATIONSHIP = "360.csm.objectNames_relationship",
    COMPANY = "360.csm.objectNames_company",
    USER = "360.csm.objectNames_user"
}


//{360.csm.objectLabels_relationship = Relationship}
//{360.csm.objectLabels_company = Company}
export enum ObjectLabels {
  RELATIONSHIP = "360.csm.objectLabels_relationship",
  COMPANY = "360.csm.objectLabels_company"
}

export enum ObjectLabelsForSection {
    RELATIONSHIP = "Relationship",
    COMPANY = "Company"
}

export const API_VERSION_NUMBER = `v2`;
export const GALAXY_ROUTE = `${API_VERSION_NUMBER}/galaxy`;
export const GALAXY_ROUTE_V1 = 'v1/galaxy';
export const LAYOUTS_STATE_ROUTE_V1 = 'v1/layouts';
export const OBJECTS_ROUTE = 'v1/data/objects';
export const EXPORTS_ROUTE = `${API_VERSION_NUMBER}/exports`;
export const FEATURES_API= 'v1/features';
export const LIBS_API_ENDPOINTS = {
  GET_REPORT_WIDGETS: `v1/api/reports/widgets`,
  GET_SUMMARY_WIDGETS: (areaName: string) => `${GALAXY_ROUTE}/bootstrap/summary/config/${areaName}`,
};
export const PERMISIONS_ROUTE = `v1/permissions/`;

export const API_ENDPOINTS = {
  GET_ADMIN_BOOTSTRAP: (areaName) => `${GALAXY_ROUTE}/bootstrap/admin/config/${areaName}`,
  GET_CONSUMPTION_BOOTSTRAP: (areaName) => `${GALAXY_ROUTE}/bootstrap/consumption/config/${areaName}`,
  GET_SALLY_BOOTSTRAP: (entityId: string) => `v1/sally/news/c360-bootstrap/${entityId}`,
  GET_BOOTSTRAP: (entity: string) => `${GALAXY_ROUTE}/bootstrap/admin/config/${entity}`,
  GET_SECTON: (layoutId: string, sectionId: string) => `${GALAXY_ROUTE}/layout/section/${layoutId}/${sectionId}`,
  GET_LAYOUT: (layoutId: string) => `${GALAXY_ROUTE}/layout/${layoutId}`,
  GET_GLOBAL_SECTION: (sectionId: string) => `${GALAXY_ROUTE}/sections/section/${sectionId}`,
  SAVE_SECTION: (layoutId: string) => `${GALAXY_ROUTE}/layout/section/${layoutId}`,
  PREVIEW_SECTION:(companyId: string) => `${GALAXY_ROUTE}/cr360/data/section/preview/${companyId}`,
  GET_EXT_LAYOUTS: (areaName: string) => `${API_VERSION_NUMBER}/externalsharing/share/extlayouts/layouts/${areaName}`,
  SAVE_GLOBAL_SECTION: (sectionId: string) => `${GALAXY_ROUTE}/sections/update/${sectionId}`,
  SECTION_STATE: `${LAYOUTS_STATE_ROUTE_V1}/state/search`,
  SAVE_SECTION_STATE: `${LAYOUTS_STATE_ROUTE_V1}/state`,
  GET_ADMIN_SECTION_PREVIEW_STATE: `${LAYOUTS_STATE_ROUTE_V1}/state`,
  RESOLVE_LAYOUT: (resolveType: string, prependUrl: string) => `${GALAXY_ROUTE}${prependUrl}/assignment/resolve/${resolveType}`,
  GET_FEATURE_CONFIG: `v1/features/evaluate`,
  DETACH_SECTION: (layoutId: string, sectionId: string) => `${GALAXY_ROUTE}/layout/section/decouple/${layoutId}/${sectionId}`,
  SAVE_PINNED_ITEMS: `${GALAXY_ROUTE}/cr360/config/section/pinned`,
  RESET_PINNED_ITEMS: `${GALAXY_ROUTE}/cr360/config/section/pinned/reset`,
  // if attribute url from context(p360) otherwise same c360
  GET_SECTION_DATA: (prependUrl: string,attributeUrl?) => attributeUrl || `${GALAXY_ROUTE}${prependUrl}/cr360/data/section`,
  GET_OBJECT_DATA: (objectName: string) => `v2/queries/${objectName}`,
  SALLY_STATE_API: `v1/sally/user/state`,
  SAVE_ATTRIBUTE: (entity, entityId) => `${OBJECTS_ROUTE}/${entity}/${entityId}?af=true`,
  GET_CTA: (payload) => {
    let ctaUrl: string = `v1/cockpit/cta/summaryRibbon/attribute?et=${payload.et}&id=${payload.id}&randprm=${new Date().getTime().toString()}`;
    if(!!payload.etId) {
      ctaUrl += `&etId=${payload.etId}`;
    }
    return ctaUrl;
  },
  GET_OPEN_CTAS: (payload, et) => {
    let openCTAUrl: string = `v1/cockpit/cta/360widget/openCTA?et=${et}&id=${payload.entityId}&randprm=${new Date().getTime().toString()}`;
    if(!!payload.entityTypeId) {
      openCTAUrl += `&etId=${payload.entityTypeId}`;
    }
    return openCTAUrl;
  },
  GET_CASES: ``,
  GET_SP: (entityId?: string, et?: string) => `v1/successPlan/360widget/activeSPSummary?et=${et}&id=${entityId}`,
  GET_DEPENDENT_PICKLIST_OPTIONS: (entity: string) => `${OBJECTS_ROUTE}/${entity}/dependent/validitems`,
  DELETE_IMAGE: (objectName: string, objectId: string, fieldName: string) => `v1/data/objects/context/image/${objectName}/${objectId}/${fieldName}`,
  GET_RELATIONSHIP_TYPES: `${GALAXY_ROUTE_V1}/relationship/type/`,
  GET_SUCCESS_SNAPSHOTS : `${EXPORTS_ROUTE}/ss`,
  GET_USER_DETAILS : `${EXPORTS_ROUTE}/google/fetch/user`,
  GET_SUCCESS_PLANS: `${EXPORTS_ROUTE}/ss/successplans`,
  GET_GS_USERS: `${API_VERSION_NUMBER}/queries/gsuser`,
  GET_USER: `v2/exports/google/fetch/user`,
  EXPORT_SS_REVAMP:`${EXPORTS_ROUTE}/ss/export/revamp`,
  EXPORT_SS:`${EXPORTS_ROUTE}/ss/export`,
  CHECK_AUTH: `${EXPORTS_ROUTE}/google/exists`,
  GOOGLE_SLIDES_FEATURE_TOGGLE: `${FEATURES_API}/evaluate/SS_GOOGLE_SLIDE_ENABLE`,
  REVOKE_ACCESS: `v2/exports/google/revoke`,
  ROLLOUT_ACTIVATION: `${GALAXY_ROUTE}/post-migrate/360V2/activate`,
  TRIGGER_MIGRATION:(queryParams) =>queryParams?`${GALAXY_ROUTE}/migrate/360V2?${queryParams}`:`${GALAXY_ROUTE}/migrate/360V2`,
  GET_LEADS_COUNT: `v1/csql/leads/tabular/records-count`,
  PRICING_SUCCESSPLAN_FEATURE_TOGGLE: `${FEATURES_API}/evaluate/SUCCESS_PLAN`,
  PRICING_RELATIONSHIP_FEATURE_TOGGLE: `${FEATURES_API}/evaluate/RELATIONSHIP`,
  SS_FEATURE_TOGGLE: `${FEATURES_API}/evaluate/SS_HA_ENABLEMENT`,
  SPACE_ENABLEMENT_CHECK: 'v1/spaces/enabled/consumption',
  CHECK_FOR_SP_AND_RS_REPORTS: `v2/exports/ss/reportExists`,
  ARR_WITH_HISTORY: "v1/udm/external/fieldTracking",
  // Moved from bm libs
  GET_OBJECTS: `v1/api/describe/listobjects/mda`,
    GET_SFDC_OBJECTS: `v1/api/describe/listobjects/SFDC`,
    GET_OBJECT_RELATIONSHIPTYPES: (objectName) => `${GALAXY_ROUTE}/relationship/association/associatedTypes/${objectName}`,
    GET_RELATIONSHIP_OBJECTS: `v1/api/describe/listobjects/mda?po=relationship`,
    UPSERT_ASSOCIATION: `${GALAXY_ROUTE}/relationship/association`,
    UPSERT_MULTIPLE_ASSOCIATION: `${GALAXY_ROUTE}/relationship/association/all`,

  FETCH_USER_PERMISSIONS: `${PERMISIONS_ROUTE}list-user-access`,
};

export const APPLICATION_ROUTES = {
  ADMIN_ROLLOUT: `/admin-rollout`,
  ADMIN_MIGRATE: `/admin-rollout/migrate`,
  FEATURE_DISBALED: `/feature-disabled`,
  LAYOUT_NOT_FOUND: '/layout-404',
  LAYOUT_OR_SECTION_NOT_FOUND: '/layout-section-404',
  STANDARD_LAYOUTS: 'standard',
  PARTNER_LAYOUTS: 'partner',
  COMMON_LAYOUTS: 'configurations/common',
  RELATIONSHIP_SECTION_CONFIG: 'configurations/relationship',
  LAYOUT_DETAILS: (layoutId: string) => `layout/${layoutId}/details`,
  LAYOUT_CONFIGURE: (layoutId: string) => `layout/${layoutId}/configure`,
  LAYOUT_ASSIGN: (layoutId: string) => `layout/${layoutId}/assign`,
  SECTION_CONFIGURE: (layoutId: string, sectionId: string) => `configure/${layoutId}/${sectionId}`,
  SECTION_DETAILS: (sectionId: string) => `section/${sectionId}/details`,
  SECTIONS_CONFIGURE: (sectionId: string) => `section/${sectionId}/configure`,
  RELATIONSHIP_ASSIGN: (configId: string) => `relationship/${configId}/assign`,
  RELATIONSHIP_CONFIGURE: (configId: string) => `relationship/${configId}/configure`,
  RELATIONSHIP_CONFIGURE_STEPS: (configId: string, step: any) => `relationship/${configId}/configure/${step}`
};

export const APPLICATION_MESSAGES = {
  SECTION_CONFIGURATION_SAVED: '360.admin.APPLICATION_MESSAGES.SECTION_CONFIGURATION_SAVED',
  SECTION_CONFIGURATION_SAVE_ERROR: '360.admin.APPLICATION_MESSAGES.SECTION_CONFIGURATION_SAVE_ERROR',
  SUMMARY_SECTION_HEADER: {
    title: "360.admin.APPLICATION_MESSAGES.SUMMARY_SECTION_HEADER.title",
    description: "360.admin.APPLICATION_MESSAGES.SUMMARY_SECTION_HEADER.description"
  },
  SALLY_ERRORS: {
    statePreservation: "360.admin.APPLICATION_MESSAGES.SALLY_ERRORS.statePreservation",
    stateResponseFailed: "360.admin.APPLICATION_MESSAGES.SALLY_ERRORS.stateResponseFailed"
  },
  SUMMARY_PREVIEW_WARNING: '360.admin.APPLICATION_MESSAGES.SUMMARY_PREVIEW_WARNING ',
  ATTRIBUTE_WIDGET_MAX_LIMIT_MESSAGE:'360.admin.APPLICATION_MESSAGES.ATTRIBUTE_WIDGET_MAX_LIMIT_MESSAGE',
  DUPLICATE_WIDGET_NOT_ALLOWED: '360.admin.APPLICATION_MESSAGES.DUPLICATE_WIDGET_NOT_ALLOWED',
  SECTION_SETTING_CLOSE: {
    TITLE: '360.admin.APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.TITLE',
    MESSAGE: '360.admin.APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.MESSAGE',
    OKTEXT: '360.admin.APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.OKTEXT',
    CANCELTEXT:'360.admin.APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.CANCELTEXT'
  },
  UNSAVED_CHANGES_PREVIEW: {
    TITLE: '360.admin.APPLICATION_MESSAGES.UNSAVED_CHANGES_PREVIEW.TITLE',
    MESSAGE: '360.admin.APPLICATION_MESSAGES.UNSAVED_CHANGES_PREVIEW.MESSAGE'
  },
  IMAGE_MAX_SIZE_EXCEED:'360.admin.APPLICATION_MESSAGES.IMAGE_MAX_SIZE_EXCEED',
  IMAGE_FORMAT_SUPPORT: '360.admin.APPLICATION_MESSAGES.IMAGE_FORMAT_SUPPORT',
  REMOVE_IMAGE: {
    TITLE: '360.csm.image_widget.removeImgTitle',
    MESSAGE: '360.csm.image_widget.removeImgMsg'
  },
  DEFAULT_ERROR_CONFIG_MESSGAE: '360.admin.APPLICATION_MESSAGES.DEFAULT_ERROR_CONFIG_MESSGAE',

  CONFIG_NOT_PRESENT: (widgets: string[]) => `Configure '${(widgets.join('\', \''
  ))}' widget(s) to save the layout.`,
  SUMMARY_SELECT_OPTIONS: (count: number) => `Select ${count} items to proceed`,
  DEFAULT_ERROR_MESSAGE: '360.admin.APPLICATION_MESSAGES.DEFAULT_ERROR_MESSAGE',
  SUMMARY_CONFIGURATION_EMPTY_DEFAULT_MESSAGE: '360.admin.APPLICATION_MESSAGES.SUMMARY_CONFIGURATION_EMPTY_DEFAULT_MESSAGE',
  IMAGE_FIELD_SELECT: '360.admin.APPLICATION_MESSAGES.IMAGE_FIELD_SELECT',
  TEXT_FIELD_SELECT: '360.admin.APPLICATION_MESSAGES.TEXT_FIELD_SELECT',
  SELECT_FIELDS_FOR_ATTRIBUTE: '360.admin.APPLICATION_MESSAGES.SELECT_FIELDS_FOR_ATTRIBUTE',
  WIDGET_NAME_FOR_ATTRIBUTE: '360.admin.APPLICATION_MESSAGES.WIDGET_NAME_FOR_ATTRIBUTE',
  SELECT_FIELD_FOR_REPORT: '360.admin.APPLICATION_MESSAGES.SELECT_FIELD_FOR_REPORT',
  SELECT_FIELDS_FOR_CUSTOMERJOURNEY: '360.admin.APPLICATION_MESSAGES.SELECT_FIELDS_FOR_CUSTOMERJOURNEY',
};


export const SUMMARY_GRIDSTER_DEFAULTS = {
  GRIDSTER_BUILDER_VIEW: () => {
    return {
      ...GRIDSTER_DEFAULTS(true),
      gridType: GridType.ScrollVertical,
      fixedRowHeight: 32,
      compactType: CompactType.CompactUpAndLeft,
      pushDirections: {
        north: false,
        south: true,
        east: false,
        west: false,
      },

      margin: 16,
      outerMargin: true,
      outerMarginTop: 20,
      outerMarginRight: 20,
      outerMarginLeft: 20,
      outerMarginBottom: 40,
      
      minCols: 24,
      maxCols: 24,
      minRows: 24,
      maxRows: 10000,
      // rowHeightRatio: 1,

      resizable: { enabled: true },
      draggable: { enabled: true },
      enableEmptyCellDrop: true,
      setGridSize: true,
      maxItemArea: 40000,
      scrollToNewItems: true,
    }
  },
  GRIDSTER_CSM_VIEW: () => {
    return {
      ...GRIDSTER_DEFAULTS(false),
      gridType: GridType.VerticalFixed,
      compactType: CompactType.CompactUpAndLeft,
      minRows: 24,
      // displayGrid: DisplayGrid.Always,
      fixedRowHeight:32,
      // rowHeightRatio: 1,
      minCols: 24,
      maxCols: 24,
      margin: 16,
      outerMargin: false,
      outerMarginTop: 0,
      outerMarginRight: 0,
      outerMarginBottom: 20,
      outerMarginLeft: 0,
      maxRows: 10000,
      setGridSize: true,
      resizable: {
        enabled: false
      }
    }
  },
  ITEM_DEFAULTS: {
    rows: 1,
    cols: 2,
    minItemCols: 1,
    minItemRows: 1,
    maxItemCols: 6,
    maxItemRows: 4
  },
  ATTRIBUTE_WIDGET_BUILDER_VIEW: (gridCols?: number, config?: {}): GridsterConfig => {
    let minCols = 6, maxCols = 6, minRows = 2;
    for(let i=2; i<=6; i++) {
      if(gridCols < 4*i && i === 2) {
        minCols = 1;
        maxCols = 1;
        minRows = 1;
      } else if(gridCols >= 4*i && gridCols < 4*(i+1)) {
        minCols = i;
        maxCols = i;
        minRows = 1;
      }
    }

    return {
      ...GRIDSTER_DEFAULTS(true),
      gridType: GridType.VerticalFixed,
      compactType: CompactType.CompactUpAndLeft,
      fixedRowHeight: 40,
      minRows,
      margin: 16,
      outerMargin: true,
      outerMarginTop: 15,
      outerMarginRight: 15,
      outerMarginBottom: 15,
      outerMarginLeft: 15,
      minCols: config && config['minCols'] ? config['minCols'] : minCols,
      maxCols: config && config['maxCols'] ? config['maxCols'] : maxCols,
      displayGrid: DisplayGrid.None,
      mobileBreakpoint: 10,
      resizable: {
        enabled: false
      },
      disableScrollHorizontal: true,
      pushDirections: {
        north: false,
        south: true,
        east: false,
        west: false,
      },
      scrollToNewItems: false,
    }
  },
  ATTRIBUTE_WIDGET_CSM_VIEW: (gridCols?: number) => {
    let minCols = 6, maxCols = 6, minRows = 2;
    for(let i=2; i<=6; i++) {
      if(gridCols < 4*i && i === 2) {
        minCols = 1;
        maxCols = 1;
        minRows = 5;
      } else if(gridCols >= 4*i && gridCols < 4*(i+1)) {
        minCols = i;
        maxCols = i;
        minRows = 5;
      }
    }

    return {
      ...GRIDSTER_DEFAULTS(false),
      gridType: GridType.VerticalFixed,
      compactType: CompactType.CompactUpAndLeft,
      fixedRowHeight: 40,
      minRows,
      margin: 16,
      outerMargin: true,
      outerMarginTop: 15,
      outerMarginRight: 15,
      outerMarginBottom: 15,
      outerMarginLeft: 15,
      minCols,
      maxCols,
      displayGrid: DisplayGrid.None,
      maxRows: 10000,
    }
  },
}

export const FIELD_TREE_DEFAULT_OPTIONS = {
  drag: {
    isOutsideDroppable: false,
    isDragIndicatorRequired: false,
    isDataTypeIconRequired: true,
    metaKeySelection: false,
    cdkDropListConnectedTo: []
  },
  nestOnDemand: true,
  resolveMultipleLookups: {},
  enablePartialTree: true,
  pageSize: 200,
  root: null,
  maxNestLevels: 2,
  allowedDataTypes: [],
  host: {},
  baseObject: null,
  loading: false,
  show: true
}

export const FIELD_TREE_DEFAULT_SEARCH_SETTINGS = {
  minQueryLength: 1,
  includeUnmatchedParents: true,
  maintainDefaultOrder: true
}

export const FEATURE_TOGGLES = ["PERSON_MAP", "C360_REVAMP"];

export const notAvailableSectionTypesInMini360 = ["SURVEY", "EMBED_PAGE", "FORECAST", "CUSTOMER_GOALS", "COMPANY_HIERARCHY"];

export const GROUPBY_DATE = {
  current_cy: [
    {value: 'QUARTERS', label: 'QUARTERLY'},
    {value: 'MONTHS', label: 'Monthly'},
    {value: 'WEEKS', label: 'Weekly'}
  ],
  current_cyq: [
    {value: 'MONTHS', label: 'Monthly'},
    {value: 'WEEKS', label: 'Weekly'},
    {value: 'DAYS', label: 'Daily'}
  ],
  this_month: [
    {value: 'WEEKS', label: 'Weekly'},
    {value: 'DAYS', label: 'Daily'}
  ],
  this_week : [
    {value: 'DAYS', label: 'Daily'}
  ],
  LAST_N_YEARS: [
    {value: 'YEARS', label: 'Yearly'},
    {value: 'QUARTERS', label: 'QUARTERLY'},
    {value: 'MONTHS', label: 'Monthly'},
    {value: 'WEEKS', label: 'Weekly'}
  ],
  LAST_N_QUARTERS : [
    {value: 'QUARTERS', label: 'QUARTERLY'},
    {value: 'MONTHS', label: 'Monthly'},
    {value: 'WEEKS', label: 'Weekly'},
    {value: 'DAYS', label: 'Daily'}
  ],
  LAST_N_MONTHS: [
    {value: 'MONTHS', label: 'Monthly'},
    {value: 'WEEKS', label: 'Weekly'},
    {value: 'DAYS', label: 'Daily'}
  ],
  LAST_N_WEEKS : [
    {value: 'WEEKS', label: 'Weekly'},
    {value: 'DAYS', label: 'Daily'}
  ]
}

export const DURATION_DATE_LITERALS = [
  {value:"CUSTOM", label: "CUSTOM"},
  {value: 'this_month', label: 'This Month'},
  {value: 'this_week', label: 'This Week'},
  {value: 'current_cy', label: 'This Year'},
  {value: 'LAST_N_MONTHS', label: 'Last N Months'},
  {value: 'LAST_N_WEEKS', label: 'Last N Weeks'},
  {value: 'current_cyq', label: 'This Quarter'},
  {value: 'LAST_N_QUARTERS', label: 'Last N Quarters'},
  {value: 'LAST_N_YEARS', label: 'Last N Years'}
]
export const RENDER_TYPES  = {
  SECTION: "SECTION",
  WIDGET: "WIDGET",
  WIDGET_SETTINGS: "WIDGET_SETTINGS",
  QUICK_ACTIONS: "QUICK_ACTIONS",
}

export const WidgetPayloadDataTypes = {
  MULTISELECTDROPDOWNLIST: "MULTISELECTDROPDOWNLIST"
}
