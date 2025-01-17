import { createSelector } from '@ngrx/store';
import * as reducer from './merge.reducers';
import { cloneDeep } from 'lodash';

export const getMergeState = createSelector(
  reducer.getAppState,
  (state: reducer.MergeCompanyState) => {
    return cloneDeep(state.mergeState);
  }
);

