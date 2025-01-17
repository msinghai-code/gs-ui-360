import { LOADER_TYPE } from "@gs/gdk/spinner";

export const PORTFOLIO_WIDGET_MESSAGE_CONSTANTS = {
  FAILED_FETCHING_OBJECT_LIST: "360.admin.PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.FAILED_FETCHING_OBJECT_LIST",
  COMPANY_LOAD_ERROR: "360.admin.PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.COMPANY_LOAD_ERROR",
  TAB_SELECTION_ERROR: "360.admin.PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.TAB_SELECTION_ERROR",
  INVALID_CONFIG: "360.admin.PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.INVALID_CONFIG",
  INVALID_VALUE: "360.admin.PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.INVALID_VALUE"
};

export const PORTFOLIO_WIDGET_CONSTANTS  = {
  COMPANY_DEFAULT_COLUMNS : ['Name', 'Arr', 'Gsid', 'Mrr', 'RenewalDate'],
  RELATIONSHIP_DEFAULT_COLUMNS : ['Name', 'Arr', 'Gsid', 'Mrr', 'RenewalDate'],
  UNSUPPORTED_DATA_TYPES: ['RICHTEXTAREA'],
  COMPANY_OBJECT_NAME: "company",
  RELATIONSHIP_OBJECT_NAME: "relationship",
  PORTFOLIO_WIDGET_ITEM: { label: 'My Portfolio', id:'Portfolio' },
  PORTFOLIO_DEFAULT_TITLE: "360.admin.PORTFOLIO_WIDGET_CONSTANTS.PORTFOLIO_DEFAULT_TITLE",
  RELATIONSHIP_TYPEID_OBJECT_NAME: "relationship_type",
  RELATIONSHIP_TYPEID_FIELD_NAME: 'TYPEID',
  NAME_SEARCHABLE_FIELD_NAMES: ["person", "company", "relationship", "user", "gsuser", "relationship_type"],
  BOOLEAN_OPTIONS: [
    {label: "360.admin.boolean_options.true", value: true, active: true},
    {label: "360.admin.boolean_options.false", value: false, active: true},
    {label: "360.admin.boolean_options.None", value: "", active: true}
  ],
  LOOKUP_EDITABLE_FIELDS_USER: ["EMAIL"],
  USER_FIELDS: ["user", "gsuser"],
  LOOKUP_NON_EDITABLE_FIELDS: ["CREATEDBY__GR", "MODIFIEDBY__GR"],
  INITIAL_FIELD_INFO: {fields: [], children: []},
  GRID_PAGE_SIZES: [25, 50],
  GRID_DEFAULT_PAGE_SIZE: 25,
  INITIAL_GRID_STATE: {
    "portfolioId": "",
    "offset": 0,
    "pageSize": 25,
    "orderByFields": [],
    "whereFilters": []
  },
    DATE_TIME_FORMAT: "YYYY-MM-DD HH:mm:ss",
    DATE_TIME_FORMAT_SLASH: "YYYY/MM/DD HH:mm:ss",
    DATE_TIME_FORMAT_WITH_TIMEZONE: "YYYY-MM-DD HH:mm:ssZ",
  COMPANY_CURRENCYISOCODE_FIELDNAME: "company_CurrencyIsoCode", 
  RELATIONSHIP_CURRENCYISOCODE_FIELDNAME: "relationship_CurrencyIsoCode", 
  RESOURCE_TYPES: {
    GS_HOME: "GS_HOME",
    GS_HOME_BUILDER: "GS_HOME_BUILDER",
    GS_HOME_PREVIEW: "GS_HOME_PREVIEW",
    DASHBOARD: "HOME_PAGE", // TODO:: get it from platform"DASHBOARD",
    DASHBOARD_BUILDER: "DASHBOARD_BUILDER",
    DASHBOARD_PREVIEW: "DASHBOARD_PREVIEW",
    DASHBOARD_EXTERNAL: "DASHBOARD_EXTERNAL",
    DASHBOARD_PAGE: "DASHBOARD"
  },
  LOADER_OPTIONS: {
    loaderType: LOADER_TYPE.SVG,
    loaderParams: {
      svg_url_class: 'gs-loader-vertical-bar-skeleton',
      svg_wrapper_class: 'gs-loader-vertical-bar-skeleton-wrapper-opacity'
    }
  }
};

export const PORTFOLIO_ADMIN_WIDGET_SETTINGS_ACTIONS = {
  SAVE: "SAVE",
  ERROR: "ERROR",
  CLOSE: "CLOSE",
  GRID_DISABLE: "GRID_DISABLE" 
}

export const PORTFOLIO_GRID_ACTIONS = {
  ROW_SELECTION_CHANGED: "ROW_SELECTION_CHANGED",
  NEXT_PAGE: 'NEXT_PAGE',
  PREVIOUS_PAGE: 'PREVIOUS_PAGE',
  PAGESIZE_CHANGE: 'PAGESIZE_CHANGE',
  SORT: 'SORT',
  SEARCH: 'SEARCH',
  FILTER: 'FILTER',
  OPEN_SETTINGS: 'OPEN_SETTINGS',
  OPEN_CHART_EDITOR_SETTINGS: 'OPEN_CHART_EDITOR_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',
  APPLY_SETTINGS: 'APPLY_SETTINGS',
  CANCEL_SETTINGS: 'CANCEL_SETTINGS',
  EXECUTE_KPI_DRILLDOWN_REPORT: 'EXECUTE_KPI_DRILLDOWN_REPORT',
  FULLSCREEN_ANIMATION_START: 'FULLSCREEN_ANIMATION_START',
  FULLSCREEN_ANIMATION_DONE: 'FULLSCREEN_ANIMATION_DONE',
  REFRESH_DATA: 'REFRESH_DATA',
  GRID_READY: 'GRID_READY',
  COLUMN_RESIZE: 'COLUMN_RESIZE',
  LOAD_COMPLETE: 'LOAD_COMPLETE',
  CELL_EDIT: 'CELL_EDIT',
  CELL_EDIT_INVALID: 'CELL_EDIT_INVALID',
  COLUMN_MOVED: 'COLUMN_MOVED',
  PAGINATION: 'PAGINATION'
}

export const RELATIONSHIP_SOURCE_DETAILS = {
  objectName: "relationship",
  objectLabel: "360.admin.light_admin_grid.relationshipTab",
  connectionType: "MDA",
  connectionId: "MDA",
  dataStoreType: "HAPOSTGRES"
};

export const COMPANY_SOURCE_DETAILS = {
  "objectName": "company",
  "objectLabel": "360.admin.light_admin_grid.companyTab",
  "connectionType": "MDA",
  "connectionId": "MDA",
  "dataStoreType": "HAPOSTGRES"
}

export const PORTFOLIO_APIUrls = {
  GET_PORTFOLIO_DATA: objectName => window.GS.isESSharing ? `v1/galaxy/share/portfolio/data/${objectName}` :`v1/galaxy/portfolio/data/${objectName}`,
  GET_ADMIN_PORTFOLIO_CONFIG: portfolioId => `v1/galaxy/portfolio/config/admin/${portfolioId}`,
  GET_USER_PORTFOLIO_CONFIG: (portfolioScope, portfolioId) => window.GS.isESSharing ? `v1/galaxy/share/portfolio/config/user/${portfolioScope}/${portfolioId}` :`v1/galaxy/portfolio/config/user/${portfolioScope}/${portfolioId}`,
  UPDATE_ADMIN_PORTFOLIO_CONFIG: portfolioId => `v1/galaxy/portfolio/config/admin/${portfolioId}`,
  UPDATE_USER_PORTFOLIO_CONFIG: `v1/galaxy/portfolio/config/user`,
  CREATE_ADMIN_PORTFOLIO_CONFIG: (portfolioScope) => `/v1/galaxy/portfolio/config/admin/init/${portfolioScope.toLowerCase()}`,
  CREATE_USER_PORTFOLIO_CONFIG: (portfolioScope) => `v1/galaxy/portfolio/config/user/init/${portfolioScope.toLowerCase()}`,
  UPDATE_PORTFOLIO_RECORD: objectName => `v1/galaxy/portfolio/data/inline/${objectName}`,
  UPDATE_BULK_PORTFOLIO_RECORDS: objectName => `v1/galaxy/portfolio/data/multi/${objectName}`,
  GET_DEPENDENT_MAPPINGS: 'v1/api/picklist/dependents/mappings/all'
};
