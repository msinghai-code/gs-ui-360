import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LOGS_FEATURE_KEY, LogsState } from './logs.reducer';

const getLogsState = createFeatureSelector<LogsState>(LOGS_FEATURE_KEY);

const getLoaded = createSelector(
  getLogsState,
  (state: LogsState) => state.loaded
);

const getMergeConfigs = createSelector(
  getLogsState,
  getLoaded,
  (state: LogsState, isLoaded) => {
    return isLoaded ? state.list : [];
  }
);

const getSelectedMergeConfig = createSelector(getLogsState, getLoaded,
  (state: LogsState, isLoaded) => {
    if (isLoaded && state.list.length > 0) {
      const selectedConfig = state.list.find(x => x.isSelected);
      if (selectedConfig)
        return selectedConfig;
      else {
        return state.list[0];
      }
    } else {
      return undefined;
    }
  }
);

export const logsQuery = {
  getLoaded,
  getMergeConfigs,
  getSelectedMergeConfig
};
