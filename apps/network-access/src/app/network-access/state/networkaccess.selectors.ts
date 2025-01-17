import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  NETWORKACCESS_FEATURE_KEY,
  NetworkaccessState
} from './networkaccess.reducer';

const getNetworkaccessState = createFeatureSelector<NetworkaccessState>(NETWORKACCESS_FEATURE_KEY);
const getLoaded = createSelector(getNetworkaccessState, (state: NetworkaccessState) => state.loaded);
const getError = createSelector(
  getNetworkaccessState,
  (state: NetworkaccessState) => state.error
);

const getAllConfiguration = createSelector(
  getNetworkaccessState,
  getLoaded,
  (state: NetworkaccessState, isLoaded) => {
    return isLoaded && state.data ? state.data.ipAddress : [];
  }
);

const getConfiguration = createSelector(
  getNetworkaccessState,
  (state: NetworkaccessState) => {
    return  state.data;
  }
)

export const networkaccessQuery = {
  getLoaded,
  getError,
  getAllConfiguration,
  getConfiguration
};
