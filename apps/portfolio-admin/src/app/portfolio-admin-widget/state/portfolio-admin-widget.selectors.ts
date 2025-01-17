import { PORTFOLIO_WIDGET_CONSTANTS } from '@gs/portfolio-lib';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import {cloneDeep} from 'lodash';
import { PORTFOLIO_ADMIN_WIDGET_FEATURE_KEY, PortfolioAdminWidgetState } from './portfolio-admin-widget.reducer';

const getPortfolioAdminWidgetState = createFeatureSelector<PortfolioAdminWidgetState>(PORTFOLIO_ADMIN_WIDGET_FEATURE_KEY);

const isObjectDescribedMap = createSelector(getPortfolioAdminWidgetState, (state: PortfolioAdminWidgetState) => state.isObjectDescribedMap);

const getCompanyFields = createSelector(getPortfolioAdminWidgetState, isObjectDescribedMap,
   (state: PortfolioAdminWidgetState, isObjectDescribedMap) => {
    return isObjectDescribedMap[PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME] ? cloneDeep(state.companyFieldTree) : PORTFOLIO_WIDGET_CONSTANTS.INITIAL_FIELD_INFO;
  });

const getRelationshipFields = createSelector(getPortfolioAdminWidgetState, isObjectDescribedMap, 
  (state: PortfolioAdminWidgetState, isObjectDescribedMap) => {
    return isObjectDescribedMap[PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME] ? cloneDeep(state.relationshipFieldTree) : PORTFOLIO_WIDGET_CONSTANTS.INITIAL_FIELD_INFO;
  });

export const portfolioAdminWidgetQuery = {
  isObjectDescribedMap, getCompanyFields, getRelationshipFields
};
