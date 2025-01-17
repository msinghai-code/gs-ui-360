import { Action } from '@ngrx/store';
import { Entity } from './companies.reducer';
import { LoadCompaniesPayload } from '../interfaces';
import { IServerSideGetRowsParams } from '@ag-grid-community/core';

export enum CompaniesActionTypes {
  LoadCompanies = '[Companies] Load Companies',
  LoadAllCompanies = '[Companies] Load All Companies',
  CompaniesLoaded = '[Companies] Companies Loaded',
  AllCompaniesLoaded = '[Companies]All Companies Loaded',
  CompaniesLoadError = '[Companies] Companies Load Error',
  LoadObjectDefinition = '[Companies] Load Object Definition',
  FilterInfoUpdated = '[Companies] Filter Info Updated',
  FieldsUpdated = '[Companies] Fields Updated',
  DeleteCompanies = '[Companies] Delete Companies',
  CompaniesDeleted = '[Companies] Companies Deleted',
  CompaniesDeleteError = '[Companies] Companies Delete Error',
  UpdateCompany = '[Companies] Update Company',
  UpsertCompanySuccess = '[Companies] Upsert Company Success',
  UpsertCompanyLoadError = '[Companies] Upsert Company Load Error',
  UpsertCompanyError = '[Companies] Upsert Company Error',
  CreateCompany = '[Companies] Create Company',
  SetListComponentInfo = '[Companies] Set List Component Info'
}

export class LoadCompanies implements Action {
  readonly type = CompaniesActionTypes.LoadCompanies;
  constructor(public payload: LoadCompaniesPayload) {}
}

export class LoadAllCompanies implements Action {
  readonly type = CompaniesActionTypes.LoadAllCompanies;
  constructor(public payload: LoadCompaniesPayload) {}
}

export class CompaniesLoadError implements Action {
  readonly type = CompaniesActionTypes.CompaniesLoadError;
  constructor(public payload: any) {}
}

export class LoadObjectDefinition implements Action {
  readonly type = CompaniesActionTypes.LoadObjectDefinition;
  constructor(public payload: any) {}
}


export class SetListComponentInfo implements Action {
  readonly type = CompaniesActionTypes.SetListComponentInfo;
  constructor(public payload: {payload: LoadCompaniesPayload, gridFilters: IServerSideGetRowsParams}) {}
}

export class FilterInfoUpdated implements Action {
  readonly type = CompaniesActionTypes.FilterInfoUpdated;
  constructor(public payload: any) {}
}

export class CompaniesLoaded implements Action {
  readonly type = CompaniesActionTypes.CompaniesLoaded;
  constructor(public payload: Entity[]) {}
}

export class AllCompaniesLoaded implements Action {
  readonly type = CompaniesActionTypes.AllCompaniesLoaded;
  constructor(public payload: Entity[]) {}
}

export class FieldsUpdated implements Action {
  readonly type = CompaniesActionTypes.FieldsUpdated;
  constructor(public payload: any[]) {}
}

export class DeleteCompanies implements Action {
  readonly type = CompaniesActionTypes.DeleteCompanies;
  constructor(public payload: any) {}
}

export class CompaniesDeleted implements Action {
  readonly type = CompaniesActionTypes.CompaniesDeleted;
  constructor(public payload: any) {}
}

export class CompaniesDeleteError implements Action {
  readonly type = CompaniesActionTypes.CompaniesDeleteError;
  constructor(public payload: any) {}
}

export class UpdateCompany implements Action {
  readonly type = CompaniesActionTypes.UpdateCompany;
  constructor(public payload: any) {}
}

export class UpsertCompanySuccess implements Action {
  readonly type = CompaniesActionTypes.UpsertCompanySuccess;
  constructor(public payload: any) {}
}

export class UpsertCompanyLoadError implements Action {
  readonly type = CompaniesActionTypes.UpsertCompanyLoadError;
  constructor(public payload: any) {}
}

export class UpsertCompanyError implements Action {
  readonly type = CompaniesActionTypes.UpsertCompanySuccess;
  constructor(public payload: any) {}
}

export class CreateCompany implements Action {
  readonly type = CompaniesActionTypes.CreateCompany;
  constructor(public payload: any) {}
}

export type CompaniesAction =
  | LoadCompanies
  | LoadAllCompanies
  | AllCompaniesLoaded
  | CompaniesLoaded
  | CompaniesLoadError
  | LoadObjectDefinition
  | FilterInfoUpdated
  | FieldsUpdated
  | DeleteCompanies
  | UpdateCompany
  | UpsertCompanyError
  | CreateCompany
  | UpsertCompanySuccess
  | SetListComponentInfo
  | CompaniesDeleted
  | UpsertCompanyLoadError
  | CompaniesDeleteError;

export const fromCompaniesActions = {
  LoadCompanies,
  LoadAllCompanies,
  CompaniesLoaded,
  AllCompaniesLoaded,
  CompaniesLoadError,
  LoadObjectDefinition,
  FilterInfoUpdated,
  FieldsUpdated,
  DeleteCompanies,
  CompaniesDeleted,
  CompaniesDeleteError,
  UpsertCompanyLoadError,
  UpdateCompany,
  SetListComponentInfo,
  CreateCompany,
  UpsertCompanySuccess
};
