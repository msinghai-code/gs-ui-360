import { createFeatureSelector, createSelector } from '@ngrx/store';
import { COMPANIES_FEATURE_KEY, CompaniesState } from './companies.reducer';

// Lookup the 'Companies' feature state managed by NgRx
const getCompaniesState = createFeatureSelector<CompaniesState>(
  COMPANIES_FEATURE_KEY
);

const getLoaded = createSelector(
  getCompaniesState,
  (state: CompaniesState) => state.loaded
);

const getError = createSelector(
  getCompaniesState,
  (state: CompaniesState) => state.error
);

const getCompanyFields = createSelector(
  getCompaniesState,
  (state: CompaniesState) => state.fields
);

const getUpsertSuccess = createSelector(
  getCompaniesState,
  (state: CompaniesState) => state.upsertSuccess
);

const getFilterInfo = createSelector(
  getCompaniesState,
  getLoaded,
  (state: CompaniesState) => state.filterInfo
);

const getAllCompaniesSize = createSelector(
  getCompaniesState,
  (state: CompaniesState) => {
    return {size: state.totalCompanies};
  }
);

const getCompanies = createSelector(
  getCompaniesState,
  getLoaded,
  (state: CompaniesState, isLoaded) => {
    return isLoaded ? state.list : undefined;
  }
);

const getSelectedId = createSelector(
  getCompaniesState,
  (state: CompaniesState) => state.selectedId
);

const getListComponentInfo = createSelector(
  getCompaniesState,
  (state: CompaniesState) => state.listComponentInfo
);

const getSelectedCompanies = createSelector(
  getCompanies,
  getSelectedId,
  (companies, id) => {
    const result = companies.find(it => it['id'] === id);
    return result ? Object.assign({}, result) : undefined;
  }
);

export const companiesQuery = {
  getLoaded,
  getError,
  getAllCompaniesSize,
  getCompanies,
  getSelectedCompanies,
  getCompanyFields,
  getFilterInfo,
  getUpsertSuccess,
  getListComponentInfo
};
