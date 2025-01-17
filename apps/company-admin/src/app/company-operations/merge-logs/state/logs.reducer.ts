import { LogsAction, LogsActionTypes } from './logs.actions';
import { MergeConfig } from '../pojo/log';
export const LOGS_FEATURE_KEY = 'merge_logs';
import { cloneDeep, isEmpty, values, forEach, includes } from 'lodash';
import { AppInjector } from '@gs/core';
import { NzI18nService } from '@gs/ng-horizon/i18n';


export interface LogsState {
  list: MergeConfig[];
  loaded: boolean;
}

export interface LogsPartialState {
  readonly [LOGS_FEATURE_KEY]: LogsState;
}

export const initialState: LogsState = {
  list: [],
  loaded: false,
};

export function logsReducer(state: LogsState = initialState, action: LogsAction): LogsState {
  switch (action.type) {
    case LogsActionTypes.MergeConfigLoaded: {
      let mergeConfig = cloneDeep(action.payload?action.payload:[]);
      if (mergeConfig && mergeConfig.length) {
        mergeConfig.map((config: MergeConfig) => {
          config.logs = [];
          config.isLoaded = false;
          const  tService = AppInjector.get(NzI18nService);
          if(!isEmpty(config.mergeDetails)){
            //{360.admin.log_reducer.merge}=Merge
            config.mergeName = values(config.mergeDetails).join(" - ") + ' ' + tService.translate('360.admin.log_reducer.merge');
          } else {
            config.mergeName = config.mergeCompanies ? config.mergeCompanies.join(' - ') + ' ' + tService.translate('360.admin.log_reducer.merge') : '';
          }
        });
      }
      state = {
        ...state,
        list: mergeConfig,
        loaded: true
      };
      break;
    }

    case LogsActionTypes.LogsLoaded: {
      const logs = cloneDeep(action.payload.logs);
      const mergeId = action.payload.mergeId;
      const jobStatus = action.payload.status;
      const jobStartDateTime = action.payload.jobStartDateTime;
      const jobEndDateTime = action.payload.jobEndDateTime;
      const configList = cloneDeep(state.list);

      forEach(logs, log => {
        if(includes(log.uiMessage.toLowerCase(), "started")) {
          log.isStartMessage = true;
        }
      });

      configList.map(config => {
        config.isSelected= false;
        if (config.mergeId === mergeId) {
          config.logs = logs;
          config.isLoaded = true;
          config.isSelected = true;
          config.jobStatus = jobStatus;
          config.jobStartDateTime = jobStartDateTime;
          config.jobEndDateTime = jobEndDateTime;
        }
        return config;
      });
      state = {
        ...state,
        list: configList
      };
      break;
    }
  }
  return state;
}
