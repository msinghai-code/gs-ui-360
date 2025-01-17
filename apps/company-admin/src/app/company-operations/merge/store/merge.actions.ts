import { Action } from '@ngrx/store';

export enum MergeActions {

  LOAD_COMPANY_DATA = '[MERGE]  Load company data',
  LOAD_COMPANY_DATA_SUCCESS = '[MERGE]  Load company data success',
  LOAD_COMPANY_DATA_FAIL = '[MERGE]  Load company data fail',
  SET_MASTER_RECORD = '[MERGE] Set master record',
  UPDATE_FIELD_RECORD = '[MERGE] Update field record',
  MERGE_COMPANY = '[MERGE] Merge company',
  MERGE_COMPANY_SUCCESS = '[MERGE] Merge company success',
  MERGE_COMPANY_FAILURE = '[MERGE] Merge company fail',
  SHOW_ALL_FIELDS = '[MERGE] Show All Fields',
  SHOW_DIFF_FIELDS = '[MERGE] Show Diff Fields',
  SET_COMPANY_LIST = '[MERGE] Set Company List',
  SET_ACTIVE_MODULE = 'SET_ACTIVE_MODULE',
  UPDATE_ERROR_INDEX = '[MERGE] Update error Index',
  DESCRIBE_OBJECT = '[MERGE] Describe Object',
  DESCRIBE_OBJECT_SUCCESS = '[MERGE] Describe Object Success',
  DESCRIBE_OBJECT_FAILURE = '[MERGE] Describe Object Failure',
  UPDATE_ALL_RECORD = '[MERGE] Update all records',
  SET_REDIRECT_LINK = '[MERGE] Set redirect link ',
  LOAD_COMPANY_LIST = '[MERGE]  Load company list',
  LOAD_COMPANY_LIST_SUCCESS = '[MERGE]  Load company list success',
  LOAD_COMPANY_LIST_FAIL = '[MERGE]  Load company list fail',
  SET_ROUTE_PATH = '[MERGE] Set Route Path',
  UPDATE_DD_LIST = '[MERGE] Update Company DD List',
  SET_INITIAL_STATE = '[MERGE] Set Initial State',
}

export class SetCompanyList implements Action {
  readonly type = MergeActions.SET_COMPANY_LIST;
  constructor(public payload?: any) {}
}

export class LoadCompanyData implements Action {
  readonly type = MergeActions.LOAD_COMPANY_DATA;
  constructor(public payload?: any) {}
}

export class LoadCompanyDataSuccess implements Action {
  readonly type = MergeActions.LOAD_COMPANY_DATA_SUCCESS;
  constructor(public payload?: any) {}
}

export class LoadLoadCompanyDataFail implements Action {
  readonly type = MergeActions.LOAD_COMPANY_DATA_FAIL;
  constructor() {}
}

export class SetMasterRecord implements Action {
  readonly type = MergeActions.SET_MASTER_RECORD;
  constructor(public payload?: any) {}
}

export class UpdateFieldRecords implements Action {
  readonly type = MergeActions.UPDATE_FIELD_RECORD;
  constructor(public payload?: any) {}
}

export class MergeCompany implements Action {
  readonly type = MergeActions.MERGE_COMPANY;
  constructor(public payload?: any) {}
}

export class MergeCompanySuccess implements Action {
  readonly type = MergeActions.MERGE_COMPANY_SUCCESS;
  constructor(public payload?: any) {}
}

export class MergeCompanyFailure implements Action {
  readonly type = MergeActions.MERGE_COMPANY_FAILURE;
  constructor(public payload?: any) {}
}

export class ShowAllFields implements Action {
  readonly type = MergeActions.SHOW_ALL_FIELDS;
  constructor() {}
}

export class ShowDifferentFields implements Action {
  readonly type = MergeActions.SHOW_DIFF_FIELDS;
  constructor() {}
}

export class UpdateErrorIndex implements Action {
  readonly type = MergeActions.UPDATE_ERROR_INDEX;
  constructor(public payload?: any) {}
}

export class DescribeObject implements Action {
  readonly type = MergeActions.DESCRIBE_OBJECT;
  constructor(public payload?: any) {}
}

export class DescribeObjectSuccess implements Action {
  readonly type = MergeActions.DESCRIBE_OBJECT_SUCCESS;
  constructor(public payload?: any) {}
}

export class DescribeObjectFail implements Action {
  readonly type = MergeActions.DESCRIBE_OBJECT_FAILURE;
  constructor(public payload?: any) {}
}

export class UpdateAllRecords implements Action {
  readonly type = MergeActions.UPDATE_ALL_RECORD;
  constructor(public payload?: any) {}
}

export class SetRedirectLink implements Action {
  readonly type = MergeActions.SET_REDIRECT_LINK;
  constructor(public payload?: any) {}
}

export class LoadCompanyList implements Action {
  readonly type = MergeActions.LOAD_COMPANY_LIST;
  constructor(public payload?: any) {}
}

export class LoadCompanyListSuccess implements Action {
  readonly type = MergeActions.LOAD_COMPANY_LIST_SUCCESS;
  constructor(public payload?: any) {}
}

export class LoadCompanyListFail implements Action {
  readonly type = MergeActions.LOAD_COMPANY_LIST_FAIL;
  constructor() {}
}

export class SetRoutePath implements Action {
  readonly type = MergeActions.SET_ROUTE_PATH;
  constructor(public payload?: any) {}
}

export class UpdateDDList implements Action {
  readonly type = MergeActions.UPDATE_DD_LIST;
  constructor(public payload?: any) {}
}

export class SetInitialState implements Action {
  readonly type = MergeActions.SET_INITIAL_STATE;
  constructor(public payload?: any) {}
}


export type MergeActionsUnion =
  | SetCompanyList
  | LoadCompanyData
  | LoadCompanyDataSuccess
  | LoadLoadCompanyDataFail
  | SetMasterRecord
  | UpdateFieldRecords
  | MergeCompany
  | MergeCompanySuccess
  | MergeCompanyFailure
  | ShowAllFields
  | any
  | ShowDifferentFields
  | UpdateErrorIndex
  | DescribeObject
  | DescribeObjectSuccess
  | DescribeObjectFail
  | UpdateAllRecords
  | SetRedirectLink
  | LoadCompanyList
  | LoadCompanyListSuccess
  | LoadCompanyListFail
  | SetRoutePath
  | UpdateDDList
  | SetInitialState;
