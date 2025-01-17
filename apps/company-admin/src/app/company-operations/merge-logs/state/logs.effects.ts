import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/angular';

import { LogsPartialState } from './logs.reducer';
import {
  LoadMergeConfig,
  MergeConfigLoaded,
  LoadMergeConfigError,
  LoadLogsByMergeId,
  MergeRetriggerError
} from './logs.actions';
import { LogsLoaded, LogsLoadError, LogsActionTypes } from './logs.actions';
import { map, switchMap } from 'rxjs/operators';
import { LOG_CONSTANTS, LOG_API_CONSTANTS } from '../logs.constants';
import { StateAction } from '@gs/gdk/core';
import {HttpProxyService} from "@gs/gdk/services/http";

@Injectable()
export class LogsEffects {
  constructor(
    private dataPersistence: DataPersistence<LogsPartialState>,
    private _httpProxy: HttpProxyService,
    private actions: Actions
  ) {}

  @Effect() loadMergeConfig$ = this.actions.pipe(
    ofType(LogsActionTypes.LoadMergeConfig),
    map((action: StateAction) => action.payload),
    switchMap(mergeId =>
      mergeId
        ? this._httpProxy.get(LOG_API_CONSTANTS.GET_MERGE_CONFIGS(mergeId))
        : this._httpProxy.get(LOG_API_CONSTANTS.GET_MERGE_CONFIGS())
    ),
    switchMap(response => {
      if (response.success) {
        const mergeConfigs =
          response && response.data ? response.data : [];
        if (mergeConfigs.length) {
          return [
            new MergeConfigLoaded(mergeConfigs),
            new LoadLogsByMergeId(mergeConfigs[0].mergeId)
          ];
        } else {
          return [new MergeConfigLoaded(mergeConfigs)];
        }
      } else {
        return [
          new LoadMergeConfigError({
            message: {
              value:
                response.errorDesc ||
                response.error.message ||
                LOG_CONSTANTS.LOAD_MERGE_CONFIGS_ERROR_MESSAGE
            }
          })
        ];
      }
    })
  );


  @Effect() retriggerMerge$ = this.actions.pipe(
    ofType(LogsActionTypes.MergeRetrigger),
    map((action: StateAction) => action.payload),
    switchMap(id => {
      const url = LOG_API_CONSTANTS.RETRIGGER_MERGE(id);
      return this._httpProxy.get(url).pipe(
        map(response => {
          if (response.success) {
            return new LoadLogsByMergeId(response.data.mergeId);
          } else {
            return new MergeRetriggerError({
              message: {
                value:
                  response.errorDesc ||
                  response.error.message
              }
            });
          }
        })
      );
    })
  );

  @Effect() loadLogs$ = this.actions.pipe(
    ofType(LogsActionTypes.LoadLogsByMergeId),
    map((action: StateAction) => action.payload),
    switchMap(id => {
      const url = LOG_API_CONSTANTS.GET_LOGS_BY_MERGE_ID(id);
        return this._httpProxy.get(url).pipe(
          map(response => {
            if (response.success) {
              return new LogsLoaded(response.data);
            } else {
              return new LogsLoadError({
                message: {
                  value:
                    response.errorDesc ||
                    response.error.message ||
                    LOG_CONSTANTS.LOAD_LOGS_BY_MERGE_ID_ERROR_MESSAGE
                }
              });
            }
          })
        )
    })
  );
}
