import { PortfolioAdminWidgetAction, PortfolioAdminWidgetActionTypes } from './portfolio-admin-widget.actions';
import {filter} from 'lodash';
import { PORTFOLIO_WIDGET_CONSTANTS } from '@gs/portfolio-lib';
import { PortfolioFieldTreeInfo } from '@gs/portfolio-lib';

export const PORTFOLIO_ADMIN_WIDGET_FEATURE_KEY = 'portfolio-admin-widget';

export interface PortfolioAdminWidgetState {
  isObjectDescribedMap: {};
  companyFieldTree: PortfolioFieldTreeInfo;
  relationshipFieldTree: PortfolioFieldTreeInfo;
}

export interface PortfolioAdminWidgetPartialState {
  readonly [PORTFOLIO_ADMIN_WIDGET_FEATURE_KEY]: PortfolioAdminWidgetState;
}

export const portfolioAdminWidgetInitialState: PortfolioAdminWidgetState = {
  isObjectDescribedMap: {},
  companyFieldTree: { fields: [], children: []},
  relationshipFieldTree: { fields: [], children: []}
};

export function portfolioAdminWidgetReducer(state: PortfolioAdminWidgetState = portfolioAdminWidgetInitialState, action: PortfolioAdminWidgetAction): PortfolioAdminWidgetState {
  switch (action.type) {
    case PortfolioAdminWidgetActionTypes.ObjectDescribed: {
      const { payload: { data: { obj: { objectName, fields } } } } = action;
      if(objectName === PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME) {
        state.companyFieldTree.fields = fields;
        state.companyFieldTree.children = action.payload.data.children;
        state.isObjectDescribedMap[PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME] = true;
      } else {
        state.relationshipFieldTree.fields = fields;
        state.relationshipFieldTree.children = action.payload.data.children;
        state.isObjectDescribedMap[PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME] = true;
      }
      state = {
        ...state
      };
      break;
    }
    case PortfolioAdminWidgetActionTypes.DescribeObject: {
      state = {
        ...state,
        isObjectDescribedMap: {}
      };
      break;
    }
    case PortfolioAdminWidgetActionTypes.DescribeObjectError: {
      state = {
        ...state
      };
      break;
    }
  }

  return state;
}