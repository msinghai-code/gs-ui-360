import { PORTFOLIO_WIDGET_CONSTANTS } from '@gs/portfolio-lib';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PortfolioCsmWidgetState, PORTFOLIO_CSM_WIDGET_FEATURE_KEY } from './portfolio-csm-widget.reducer';
import cloneDeep from 'lodash/cloneDeep';

const getPortfolioCsmWidgetState = createFeatureSelector<PortfolioCsmWidgetState>(PORTFOLIO_CSM_WIDGET_FEATURE_KEY);

const isObjectDescribedMap = createSelector(getPortfolioCsmWidgetState, (state: PortfolioCsmWidgetState) => state.isObjectDescribedMap);

const getCompanyFields = createSelector(getPortfolioCsmWidgetState, isObjectDescribedMap,
   (state: PortfolioCsmWidgetState, isObjectDescribedMap) => {
    return isObjectDescribedMap[PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME] ? cloneDeep(state.companyFieldTree) : PORTFOLIO_WIDGET_CONSTANTS.INITIAL_FIELD_INFO;
  });

const getRelationshipFields = createSelector(getPortfolioCsmWidgetState, isObjectDescribedMap,
  (state: PortfolioCsmWidgetState, isObjectDescribedMap) => {
    return isObjectDescribedMap[PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME] ? cloneDeep(state.relationshipFieldTree) : PORTFOLIO_WIDGET_CONSTANTS.INITIAL_FIELD_INFO;
  });

export const portfolioCsmWidgetQuery = {
  isObjectDescribedMap, getCompanyFields, getRelationshipFields
};
