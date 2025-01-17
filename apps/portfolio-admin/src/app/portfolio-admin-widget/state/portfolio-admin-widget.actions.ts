import { Action } from '@ngrx/store';

export enum PortfolioAdminWidgetActionTypes {
  DescribeObject = '[PortfolioAdminWidget] Describe Object',
  ObjectDescribed = '[PortfolioAdminWidget] Object Described',
  DescribeObjectError = '[PortfolioAdminWidget] Describe Object Error',
  LoadReportData = '[PortfolioAdminWidget] Load Report Data',
  LoadAllRelationships = '[PortfolioAdminWidget] Load All Relationships',
  AllCompaniesLoaded = '[PortfolioAdminWidget] All Companies Loaded',
  AllRelationshipsLoaded = '[PortfolioAdminWidget] All Relationships Loaded',
  LoadError = '[PortfolioAdminWidget] Load Error',
  ShowToastMessage = '[PortfolioAdminWidget] Show Toast Message'
}

export class DescribeObject implements Action {
  readonly type = PortfolioAdminWidgetActionTypes.DescribeObject;
  constructor(public payload: any) { }
}

export class ObjectDescribed implements Action {
  readonly type = PortfolioAdminWidgetActionTypes.ObjectDescribed;
  constructor(public payload: any) { }
}

export class DescribeObjectError implements Action {
  readonly type = PortfolioAdminWidgetActionTypes.DescribeObjectError;
  constructor(public payload: any) { }
}

export class ShowToastMessage implements Action {
  readonly type = PortfolioAdminWidgetActionTypes.ShowToastMessage;
  constructor(public payload: any) { }
}

export type PortfolioAdminWidgetAction =
  DescribeObject | 
  ObjectDescribed | 
  DescribeObjectError |
  ShowToastMessage;
  
  export const fromPortfolioAdminWidgetActions = {
    DescribeObject,
    ObjectDescribed,
    DescribeObjectError,
    ShowToastMessage
};
