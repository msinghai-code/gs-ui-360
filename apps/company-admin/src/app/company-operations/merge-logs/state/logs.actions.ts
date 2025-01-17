import { Action } from '@ngrx/store';

export enum LogsActionTypes {
  LoadLogsByMergeId = '[Logs] Load Logs',
  LogsLoaded = '[Logs] Logs Loaded',
  LogsLoadError = '[Logs] Logs Load Error',
  LoadMergeConfig = '[Logs] Load Merge Config',
  MergeConfigLoaded = '[Logs] Merge Config Loaded',
  LoadMergeConfigError = '[Logs] Load Merge Config Error',
  MergeRetrigger = '[Logs] Merge Retrigger',
  MergeRetriggerError = '[Logs] Merge Retrigger Error',
}

export class LoadLogsByMergeId implements Action {
  readonly type = LogsActionTypes.LoadLogsByMergeId;
  constructor(public payload: any) {}
}

export class LogsLoadError implements Action {
  readonly type = LogsActionTypes.LogsLoadError;
  constructor(public payload: any) {}
}

export class LogsLoaded implements Action {
  readonly type = LogsActionTypes.LogsLoaded;
  constructor(public payload: any) {}
}

export class LoadMergeConfig implements Action {
  readonly type = LogsActionTypes.LoadMergeConfig;
  constructor(public payload?: any) {}
}

export class MergeRetrigger implements Action {
  readonly type = LogsActionTypes.MergeRetrigger;
  constructor(public payload: string) {}
}

export class MergeRetriggerError implements Action {
  readonly type = LogsActionTypes.MergeRetriggerError;
  constructor(public payload: any) {}
}

export class LoadMergeConfigError implements Action {
  readonly type = LogsActionTypes.LoadMergeConfigError;
  constructor(public payload: any) {}
}

export class MergeConfigLoaded implements Action {
  readonly type = LogsActionTypes.MergeConfigLoaded;
  constructor(public payload: any) {}
}

export type LogsAction = LoadLogsByMergeId | LogsLoaded | LogsLoadError | LoadMergeConfig | LoadMergeConfigError | MergeConfigLoaded;

export const fromLogsActions = {
  LoadLogsByMergeId,
  LogsLoaded,
  LogsLoadError,
  LoadMergeConfig,
  LoadMergeConfigError,
  MergeConfigLoaded,
  MergeRetrigger,
  MergeRetriggerError
};
