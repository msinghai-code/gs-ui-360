import { PORTFOLIO_WIDGET_CONSTANTS } from '@gs/portfolio-lib';
import { PortfolioCsmWidgetAction, PortfolioCsmWidgetActionTypes } from './portfolio-csm-widget.actions';
import { PortfolioFieldTreeInfo } from '@gs/portfolio-lib';

export const PORTFOLIO_CSM_WIDGET_FEATURE_KEY = 'portfolio-csm-widget';

export interface PortfolioCsmWidgetState {
  isObjectDescribedMap: {};
  companyFieldTree: PortfolioFieldTreeInfo;
  relationshipFieldTree: PortfolioFieldTreeInfo;
}

export interface PortfolioCsmWidgetPartialState {
  readonly [PORTFOLIO_CSM_WIDGET_FEATURE_KEY]: PortfolioCsmWidgetState;
}

export const portfolioCsmWidgetInitialState: PortfolioCsmWidgetState = {
  isObjectDescribedMap: {},
  companyFieldTree: { fields: [], children: []},
  relationshipFieldTree: { fields: [], children: []}
};

export function portfolioCsmWidgetReducer(state: PortfolioCsmWidgetState = portfolioCsmWidgetInitialState, action: PortfolioCsmWidgetAction): PortfolioCsmWidgetState {
  switch (action.type) {
    case PortfolioCsmWidgetActionTypes.ObjectDescribed: {
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
    case PortfolioCsmWidgetActionTypes.DescribeObject: {
      state = {
        ...state,
        isObjectDescribedMap: {}
      };
      break;
    }
    case PortfolioCsmWidgetActionTypes.DescribeObjectError: {
      state = {
        ...state
      };
      break;
    }
  }

  return state;
}
