import {
  NetworkaccessAction,
  NetworkaccessActionTypes
} from './networkaccess.actions';

export const NETWORKACCESS_FEATURE_KEY = 'networkaccess';

/**
 * Interface for the 'Networkaccess' data used in
 *  - NetworkaccessState, and
 *  - networkaccessReducer
 *
 *  Note: replace if already defined in another module
 */

/* tslint:disable:no-empty-interface */
export interface Entity {}

export interface NetworkaccessState {
  data: any;
  loaded: boolean; // has the Networkaccess list been loaded
  error?: any; // last none error (if any)
}

export interface NetworkaccessPartialState {
  readonly [NETWORKACCESS_FEATURE_KEY]: NetworkaccessState;
}

export const initialState: NetworkaccessState = {
  data: {},
  loaded: false
};

export function networkaccessReducer(
  state: NetworkaccessState = initialState,
  action: NetworkaccessAction
): NetworkaccessState {
  switch (action.type) {
    case NetworkaccessActionTypes.ConfigurationLoaded: {
      state = {
        ...state,
        data : action.payload,
        loaded: true
      };
      break;
    }
  }
  return state;
}
