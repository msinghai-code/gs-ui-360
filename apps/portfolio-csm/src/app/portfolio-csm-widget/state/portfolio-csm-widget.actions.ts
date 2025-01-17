import { Action } from '@ngrx/store';

export enum PortfolioCsmWidgetActionTypes {
  ShowToastMessage = '[PortfolioCsmWidget] Show Toast Message',
  DescribeObject = '[PortfolioCsmWidget] Describe Object',
  ObjectDescribed = '[PortfolioCsmWidget] Object Described',
  DescribeObjectError = '[PortfolioCsmWidget] Describe Object Error'
}

export class DescribeObject implements Action {
  readonly type = PortfolioCsmWidgetActionTypes.DescribeObject;
  constructor(public payload: any) { }
}

export class ObjectDescribed implements Action {
  readonly type = PortfolioCsmWidgetActionTypes.ObjectDescribed;
  constructor(public payload: any) { }
}

export class DescribeObjectError implements Action {
  readonly type = PortfolioCsmWidgetActionTypes.DescribeObjectError;
  constructor(public payload: any) { }
}

export class ShowToastMessage implements Action {
  readonly type = PortfolioCsmWidgetActionTypes.ShowToastMessage;
  constructor(public payload: any) { }
}

export type PortfolioCsmWidgetAction =
  DescribeObject | 
  ObjectDescribed | 
  DescribeObjectError |
  ShowToastMessage;
  
  export const fromPortfolioCsmWidgetActions = {
    DescribeObject,
    ObjectDescribed,
    DescribeObjectError,
    ShowToastMessage
};
