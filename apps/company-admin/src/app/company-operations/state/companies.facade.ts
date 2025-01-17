import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { CompaniesPartialState } from './companies.reducer';
import { companiesQuery } from './companies.selectors';
import { LoadCompanies, FieldsUpdated, LoadObjectDefinition, FilterInfoUpdated, DeleteCompanies, LoadAllCompanies, UpdateCompany, CreateCompany, SetListComponentInfo, UpsertCompanyLoadError } from './companies.actions';
import { Actions, ofType } from '@ngrx/effects';
import { CompaniesFilterInfo, LoadCompaniesPayload, CompanyUpsertResolverResponse } from '../interfaces';
import { cloneDeep } from 'lodash';
import { IServerSideGetRowsParams } from '@ag-grid-community/core';

@Injectable()
export class CompaniesFacade {

  appConfig: any;
  loaded$ = this.store.pipe(select(companiesQuery.getLoaded));
  companiesLoaded$ = this.store.pipe(select(companiesQuery.getCompanies));
  allCompaniesLoaded$ = this.store.pipe(select(companiesQuery.getAllCompaniesSize));
  selectedCompanies$ = this.store.pipe(select(companiesQuery.getSelectedCompanies));
  fieldsUpdated$ =  this.store.pipe(select(companiesQuery.getCompanyFields));
  filterInfoUpdated$ = this.store.pipe(select(companiesQuery.getFilterInfo));
  isUpsertSuccess$ = this.store.pipe(select(companiesQuery.getUpsertSuccess));
  companyPayloadUpdated$ = this.store.pipe(select(companiesQuery.getListComponentInfo));
  
  private companyObjectDefinitionLoaded = false;

  constructor(private store: Store<any>, private actions: Actions) {
    this.store.select('appConfig').subscribe(config => {
      this.appConfig = config;
    });
  }

  loadAll(payload: LoadCompaniesPayload, allCompaniesUpdateRequired?: boolean) {
    if(allCompaniesUpdateRequired) {
      const allCompaniesPayload = cloneDeep(payload);
      allCompaniesPayload.select = ["Gsid"];
      delete allCompaniesPayload.orderBy;
      delete allCompaniesPayload.limit;
      delete allCompaniesPayload.offset;
      this.store.dispatch(new LoadAllCompanies(allCompaniesPayload));
    }
    this.store.dispatch(new LoadCompanies(cloneDeep(payload)));
  }

  setListComponentInfo(info: {payload: LoadCompaniesPayload, gridFilters: any}) {
    this.store.dispatch(new SetListComponentInfo(info));
  }

  loadCompanyObjectDefinition(payload?: any) {
    const config = payload ? payload : {
      host: { id: 'MDA', name: 'MDA', type: 'MDA' },
      objectName: "company"
    };
    this.store.dispatch(new LoadObjectDefinition(config));
  }

  setIsCompanyObjectDefinitionLoaded(loaded: boolean) {
    this.companyObjectDefinitionLoaded = loaded;
  }

  isCompanyObjectDefinitionLoaded() {
    return this.companyObjectDefinitionLoaded;
  }
  
  onFieldsUpdated(payload: any[]) {
    this.store.dispatch(new FieldsUpdated(payload));
  }

  dispatchCompanyUpdate(companyInfo: {value: any, fields: any[]}, isUpdate: boolean) {
    if(isUpdate) {
      this.store.dispatch(new UpdateCompany(companyInfo));
    } else {
      this.store.dispatch(new CreateCompany(companyInfo));
    }
  }

  dispatchCompanyUpsertLoadError(errorResponse: CompanyUpsertResolverResponse) {
    this.store.dispatch(new UpsertCompanyLoadError({message:{ value: errorResponse.message}}));
  }

  onFilterInfoUpdated(payload: CompaniesFilterInfo) {
    this.store.dispatch(new FilterInfoUpdated(payload));
  }

  getAppConfig() {
    return this.appConfig;
  }

  deleteCompanies(payload: any) {
    this.store.dispatch(new DeleteCompanies(payload));
  }
}
