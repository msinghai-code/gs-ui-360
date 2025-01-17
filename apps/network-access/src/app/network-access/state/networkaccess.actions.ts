import { Action } from '@ngrx/store';

export enum NetworkaccessActionTypes {
  LoadAllConfiguration = '[Networkaccess] LoadAllConfiguration',
  ConfigurationLoaded = '[Networkaccess] ConfigurationLoaded',
  LoadConfigurationFailed = '[Networkaccess] LoadConfigurationFailed',
  UpsertConfiguration = '[Networkaccess] UpsertConfiguration',
  ConfigurationUpserted = '[Networkaccess] ConfigurationUpserted',
  UpsertConfigurationFailed = '[Networkaccess] UpsertConfigurationFailed'
}

export class LoadAllConfiguration implements Action {
  readonly type = NetworkaccessActionTypes.LoadAllConfiguration;
}

export class ConfigurationLoaded implements Action {
  readonly type = NetworkaccessActionTypes.ConfigurationLoaded;
  constructor(public payload: any) { }
}

export class LoadConfigurationFailed implements Action {
  readonly type = NetworkaccessActionTypes.LoadConfigurationFailed;
  constructor(public payload: any) { }
}

export class UpsertConfiguration implements Action {
  readonly type = NetworkaccessActionTypes.UpsertConfiguration;
  constructor(public payload: any) { }
}

export class ConfigurationUpserted implements Action {
  readonly type = NetworkaccessActionTypes.ConfigurationUpserted;
  constructor(public payload: any) { }
}

export class UpsertConfigurationFailed implements Action {
  readonly type = NetworkaccessActionTypes.UpsertConfigurationFailed;
  constructor(public payload: any) { }
}

export type NetworkaccessAction =
  LoadAllConfiguration
  | ConfigurationLoaded
  | LoadConfigurationFailed
  | UpsertConfiguration
  | ConfigurationUpserted
  | UpsertConfigurationFailed;

export const fromNetworkaccessActions = {
  LoadAllConfiguration,
  ConfigurationLoaded,
  LoadConfigurationFailed,
  UpsertConfiguration,
  ConfigurationUpserted,
  UpsertConfigurationFailed
};
