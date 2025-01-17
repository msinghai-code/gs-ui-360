import { CompaniesAction, CompaniesActionTypes } from './companies.actions';
import { map, filter, includes, size, cloneDeep } from 'lodash';
import { CompaniesFilterInfo, LoadCompaniesPayload } from '../interfaces';
import { IServerSideGetRowsParams } from '@ag-grid-community/core';

export const COMPANIES_FEATURE_KEY = 'companies';

/**
 * Interface for the 'Companies' data used in
 *  - CompaniesState, and the reducer function
 *
 *  Note: replace if already defined in another module
 */

/* tslint:disable:no-empty-interface */
export interface Entity {}

export interface CompaniesState {
  list: Entity[]; // list of Companies; analogous to a sql normalized table
  selectedId?: string | number; // which Companies record has been selected
  loaded: boolean; // has the Companies list been loaded
  error?: any; // last none error (if any)
  listComponentInfo?: {payload: LoadCompaniesPayload, gridFilters: any};
  fields?: any[];
  filterInfo?: CompaniesFilterInfo;
  totalCompanies?: number;
  upsertSuccess?: any;
}

export interface CompaniesPartialState {
  readonly [COMPANIES_FEATURE_KEY]: CompaniesState;
}

export const initialState: CompaniesState = {
  list: [],
  loaded: false
};

export function reducer(
  state: CompaniesState = initialState,
  action: CompaniesAction
): CompaniesState {
  switch (action.type) {
    case CompaniesActionTypes.CompaniesLoaded: {
      state = {
        ...state,
        list: action.payload,
        loaded: true
      };
      break;
    }
    case CompaniesActionTypes.UpsertCompanySuccess: {
      state = {
        ...state,
        upsertSuccess: action.payload
      };
    }
    break;
    case CompaniesActionTypes.SetListComponentInfo: {
      state = {
        ...state,
        listComponentInfo: cloneDeep(action.payload)
      };
    }
    break;
    case CompaniesActionTypes.AllCompaniesLoaded: {
      state = {
        ...state,
        totalCompanies: size(action.payload)
      };
      break;
    }
    case CompaniesActionTypes.FilterInfoUpdated: {
      state = {
        ...state,
        filterInfo: cloneDeep(action.payload)
      };
      break;
    }
    case CompaniesActionTypes.FieldsUpdated: {
      state = {
        ...state,
        fields: cloneDeep(action.payload)
      };
      break;
    }
    case CompaniesActionTypes.CompaniesDeleted: {
      const deletedGsids = map(action.payload.data, 'Gsid');
      const updatedList = filter(state.list, (company: any) => !includes(deletedGsids, company.Gsid));
      state = {
        ...state,
        list: updatedList,
        totalCompanies: state.totalCompanies - size(deletedGsids),
        loaded: true
      };
      break;
    }
    case CompaniesActionTypes.CompaniesLoadError:
    case CompaniesActionTypes.UpsertCompanyLoadError:
    case CompaniesActionTypes.CompaniesDeleteError: {
      state = {
        ...state,
        loaded: true
      };
      break;
    }

  }
  return state;
}
