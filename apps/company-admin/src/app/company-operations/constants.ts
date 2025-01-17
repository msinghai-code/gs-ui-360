import { COLUMN_VIEW } from "@gs/gdk/grid";

export const APIUrls = {
    GET_COMPANIES: 'v2/queries/company',
    MERGE_COMPANIES: 'v1/data/merge',
    DESCRIBE_OBJECT: object => `v1/api/describe/MDA/${object}?ppos=true`,
    ADVANCE_LOOKUPSEARCH: 'v1/api/describe/advancedlookupsearch',
    GET_COMPANY_FIELDS: '/v1/data/objects/flatquery/company',
    DELETE_COMPANIES: objectName => `/v1/data/objects/${objectName}?keys=Gsid`,
    UPDATE_COMPANY: 'v1/data/objects/company?keys=Gsid',
    CREATE_COMPANY: 'v1/data/objects/company/',
    GET_COMPANY_INFO: (companyRecordId) => `v1/data/objects/company/${companyRecordId}`,
    GET_DEPENDENT_MAPPINGS: 'v1/api/picklist/dependents/mappings/all'
};

export const GRIDTOSERVEROPERATORMAP = {
    "EQUALS": "EQ",
    "NOTEQUAL": "NE",
    "CONTAINS": "CONTAINS",
    "NOTCONTAINS": "DOES_NOT_CONTAINS",
    "STARTSWITH": "STARTS_WITH",
    "ENDSWITH": "ENDS_WITH",
    "LESSTHAN": "LT",
    "LESSTHANOREQUAL": "LTE",
    "GREATERTHAN": "GT",
    "GREATERTHANOREQUAL": "GTE",
    "INRANGE": "BTW"
};

export enum DataTypesMap {
    SFDCID = "STRING",
    PICKLIST = "STRING",
    EMAIL = "STRING",
    LOOKUP = "STRING",
    PERCENTAGE = "NUMBER",
    CURRENCY = "NUMBER",
    GSID = "STRING",
    RICHTEXTAREA = "STRING",
    MULTISELECTDROPDOWNLIST = "STRING",
    JSON = "STRING",
    JSONSTRING = "STRING",
    JSONNUMBER = "NUMBER",
    JSONBOOLEAN = "BOOLEAN",
    WHOID = "STRING",
    WHATID = "STRING",
    CONTEXT = "STRING",
    URL = "STRING",
    DATE = "DATE",
    DATETIME = "DATETIME",
    STRING = "STRING",
    NUMBER = "NUMBER"
}

export enum DataTypes {
    SFDCID = "SFDCID",
    PICKLIST = "PICKLIST",
    EMAIL = "EMAIL",
    LOOKUP = "LOOKUP",
    PERCENTAGE = "PERCENTAGE",
    CURRENCY = "CURRENCY",
    GSID = "GSID",
    RICHTEXTAREA = "RICHTEXTAREA",
    MULTISELECTDROPDOWNLIST = "MULTISELECTDROPDOWNLIST",
    JSON = "JSON",
    JSONSTRING = "JSONSTRING",
    JSONNUMBER = "JSONNUMBER",
    JSONBOOLEAN = "JSONBOOLEAN",
    WHOID = "WHOID",
    WHATID = "WHATID",
    CONTEXT = "CONTEXT",
    URL = "URL",
    DATE = "DATE",
    DATETIME = "DATETIME",
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    IMAGE = "IMAGE",
}

export enum ColumnWidthMap {
    DATE = 200,
    DATETIME = 250,
    STRING = 250,
    JSONSTRING = 250,
    SFDCID = 250,
    GSID = 250,
    WHOID = 250,
    WHATID = 250,
    RICHTEXTAREA = 250,
    LOOKUP = 250,
    CURRENCY = 200,
    JSON = 200,
    NUMBER = 200,
    JSONNUMBER = 200,
    PERCENTAGE = 200,
    MULTISELECTDROPDOWNLIST = 250,
    EMAIL = 250,
    PICKLIST = 250,
    JSONBOOLEAN = 200
}

export const DEFAULT_COLUMNS = ["Name", "Gsid"];
export const COMPANY_GRID_ROWS_LIMIT = 100;
export const COMPANY_GRID_PAGE_SIZES = [100, 200];
export const COMPANY_PAGINATOR_RECORD_TYPE = "360.company_operations.companies";

export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const DATE_TIME_FORMAT_WITH_TIMEZONE = "YYYY-MM-DD HH:mm:ssZ";
export const DATE_FORMAT = "YYYY-MM-DD";

export const UNSORTABLE_COLUMNS_DATATYPES = [DataTypes.RICHTEXTAREA, DataTypes.MULTISELECTDROPDOWNLIST, DataTypes.IMAGE];
export const UNSEARCHABLE_COLUMNS_DATATYPES = [DataTypes.RICHTEXTAREA, DataTypes.JSONBOOLEAN, DataTypes.JSONNUMBER, DataTypes.JSONSTRING, DataTypes.MULTISELECTDROPDOWNLIST, DataTypes.PICKLIST, DataTypes.BOOLEAN, DataTypes.IMAGE];
// export const CUSTOM_SEARCHABLE_COLUMN_DATATYPES = [DataTypes.MULTISELECTDROPDOWNLIST, DataTypes.PICKLIST];
export const DEFAULT_STRING_FILTER_OPTION = "CONTAINS";
export const DEFAULT_NUMBER_FILTER_OPTION = "EQ";
export const DEFAULT_DATE_FILTER_OPTION = "EQ";


export enum DEFAULT_FIELDS_ORDER_MAP {
    NAME= 1, 
    COMPANYTYPE=3, 
    PARENTCOMPANY = 4, 
    INDUSTRY = 5, 
    INDUSTRYNEW = 6, 
    CURRENCYISOCODE = 7, 
    TICKERSYMBOL = 8, 
    EMPLOYEES =9, 
    SFDCACCOUNTID = 10, 
    TAGS = 12,
    USERS = 13,
    CSM = 14,
    MANAGEDAS = 15,
    ARR = 16,
    MRR = 17,
    STAGE = 18,
    STATUS = 19,
    ORIGINALCONTRACTDATE = 20,
    RENEWALDATE = 21,
    CUSTOMERLIFETIMEINMONTHS = 22,
    LIFECYCLEINWEEKS = 23,
    SCORECARDID = 24,
    TREND= 25,
    CURRENTSCORE = 26,
    PREVIOUSSCORE = 27,
    NPS= 29,
    GSID = 30,
    CREATEDBY = 31,
    CREATEDDATE = 32,
    MODIFIEDBY = 33,
    MODIFIEDDATE = 34
}

export enum FILTER_OPTIONS_VALUES {
    IS_NULL = "IS_NULL",
    IS_NOT_NULL = "IS_NOT_NULL",
    BTW = "BTW"
}

export const NUMBER_OF_STANDARD_FIELDS = 34;

export const DISABLED_FIELDS = [
    'SCORECARDID',
    'TREND',
    'CURRENTSCORE',
    'PREVIOUSSCORE',
    'NPS',
    'GSID',
    'CREATEDBY',
    'CREATEDDATE',
    'MODIFIEDBY',
    'MODIFIEDDATE'
];

export const ACTION_COLUMN_DETAIL = {
    headerName: '',
    field: 'action_column',
    fieldName: 'action_column',
    lockPosition: true,
    pinned: "right",
    stopRowSelection: true,
    minWidth: 50,
    width:50,
    columnDataType: COLUMN_VIEW.GRID_ACTION_COLUMN
};

export enum MappingObjects {
    GS_COMPANY_ID = "company",
    GS_COMPANY_NAME = "company",
    GS_USER_ID = "gsuser",
    GS_USER_NAME = "gsuser",
    GS_USER_EMAIL = "gsuser",
    GS_RELATIONSHIP_ID = "relationship",
    GS_RELATIONSHIP_NAME = "relationship",
    GS_RELATIONSHIP_TYPE_ID = "relationship_type",
    GS_RELATIONSHIP_TYPE_NAME = "relationship_type"
}

export const DEFAULT_MAPPINGS = ["Name", "Gsid"];

export const SORTABLE_FIELD_NAMES = ["Name", "CreatedDate", "ModifiedDate"];
export const PRIORITY_FIELD_NAMES = ["GSID", "NAME", "ModifiedDate", "ModifiedAt", "CreatedDate", "CreatedAt"];
export const OBJECT_GRAPH_URL = (ApiEndPoint) => ApiEndPoint + '/v1/ui/company?#objectGraph';
export const MDA_HOST = { id: 'MDA', name: 'MDA', type: 'MDA' };
export const COMPANY_OBJECT_NAME = 'company';
export const CURRENCYISOCODE_FIELD_NAME = 'currencyisocode';
export const NAME_SEARCHABLE_FIELD_NAMES = ["person", "company", "relationship", "user", "gsuser", "relationship_type"];

export enum CompanyUpsertResolverMessagesMap {
    SCHEMA_NOT_FOUND = 'Schema not Found',
    COMPANY_NOT_FOUND = 'Requested company not found',
    COMPANY_DATA_NOT_FOUND = 'Company object data not found',
    UNKNOWN_ERROR = 'Unknown error',
    NO_CONFIG = 'No config found.'
}

export enum MessagesMap {
    COMPANY_UPDATE_SUCCESS = "Updated Successfully",
    COMPANY_UPDATE_ERROR = "Unable to update company",
    COMPANY_DELETED_SUCCESS = "Deleted Successfully",
    COMPANY_CREATE_SUCCESS = "Created Successfully",
    COMPANY_CREATE_ERROR = "Unable to create company",
    COMPANY_LOAD_ERROR = "Unable to load companies",
    COMPANY_DELETE_ERROR = "Unable to delete companies"
}

export enum CompanyListHeaderActions {
    REFRESH = "Refresh",
    MERGE = "Merge",
    MERGE_LOGS = "Merge Logs",
    ADD = 'Add',
    DELETE = 'Delete'
}

export enum CompanyListHeaderActionslabels {
    REFRESH = "360.list_comp.REFRESH",
    MERGE = "360.list_comp.MERGE",
    MERGE_LOGS = "360.list_comp.MERGE_LOGS",
    ADD = '360.list_comp.ADD',
    DELETE = '360.list_comp.DELETE'
}

export enum CompanyListGridContextMenuItems {
    EDIT = "edit",
    DELETE = "delete"
}
