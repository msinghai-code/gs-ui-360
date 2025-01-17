import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import {
  LoadCompanies,
  CompaniesLoaded,
  CompaniesLoadError,
  CompaniesActionTypes,
  LoadObjectDefinition,
  FieldsUpdated,
  DeleteCompanies,
  CompaniesDeleted,
  LoadAllCompanies,
  AllCompaniesLoaded,
  CreateCompany,
  UpdateCompany,
  UpsertCompanySuccess,
  SetListComponentInfo,
  CompaniesDeleteError,
  UpsertCompanyError
} from './companies.actions';
import { APIUrls, DEFAULT_COLUMNS, MessagesMap } from '../constants';
import { map, switchMap } from 'rxjs/operators';
import { DescribeService } from "@gs/gdk/services/describe";
import {HttpProxyService} from "@gs/gdk/services/http";
import { buildQuery } from '../list-functions';
import { CompaniesFacade } from './companies.facade';
import { forEach, includes, filter, cloneDeep } from 'lodash';
import { CompanyUpsertUtils } from '../CompanyUpsertUtils';
import { IServerSideGetRowsParams } from '@ag-grid-community/core';
import { of } from 'rxjs';
import {NzNotificationService} from "@gs/ng-horizon/notification";

@Injectable()
export class CompaniesEffects {
  allCompaniesCache;
  
  @Effect() loadCompanies$ = this.actions$.pipe(
    ofType(CompaniesActionTypes.LoadCompanies),
    map((action: LoadCompanies) => action.payload),
    switchMap(config => {
      return this._http.post(APIUrls.GET_COMPANIES, config).pipe(
        map((response) => {
          if (response.success) {
            return new CompaniesLoaded(response.data.records);
          } else {
            return new CompaniesLoadError({
              message: { value: response.errorDesc || response.error.message || MessagesMap.COMPANY_LOAD_ERROR }
            });
          }
        }));
    })
  );

  @Effect() loadAllCompanies$ = this.actions$.pipe(
    ofType(CompaniesActionTypes.LoadAllCompanies),
    map((action: LoadAllCompanies) => action.payload),
    switchMap(config => {
      return (this.allCompaniesCache ? of(this.allCompaniesCache) : this._http.post(APIUrls.GET_COMPANIES, config)).pipe(
        map((response) => {
          this.allCompaniesCache = response;
          if (response.success) {
            return new AllCompaniesLoaded(response.data.records);
          } else {
            return new CompaniesLoadError({
              message: { value: response.errorDesc || response.error.message || MessagesMap.COMPANY_LOAD_ERROR }
            });
          }
        }));
    })
  );

  @Effect() LoadObjectDefinition$ = this.actions$.pipe(
    ofType(CompaniesActionTypes.LoadObjectDefinition),
    map((action: LoadObjectDefinition) => action.payload),
    switchMap(config => {
        config.host = {
            ...config.host,
            apiContext: 'api/reporting/describe'
        }
      return this._ds
        .getDescribedObject(config.host, config.objectName, false, true, true)
        .then(schema => {
          const modifiedSchema = buildQuery(schema);
          const displayFields = [];
          forEach(modifiedSchema.schema.fields, field => {
            if(includes(DEFAULT_COLUMNS, field.fieldName)) {
              field.hidden = false;
            }
            if(!field.hidden) {
              displayFields.push(field.fieldName);
            }
          });
          modifiedSchema.query.select = filter(modifiedSchema.query.select, id => includes(displayFields, id));
          modifiedSchema.query.orderBy = {"Name": "asc"};
          this.companiesFacade.onFilterInfoUpdated(modifiedSchema.query);
          this.companiesFacade.onFieldsUpdated(modifiedSchema.schema.fields);
          return new SetListComponentInfo({payload: modifiedSchema.query, gridFilters: <IServerSideGetRowsParams>{}});
        });
    })
  );

  @Effect() DeleteCompanies$ = this.actions$.pipe(
    ofType(CompaniesActionTypes.DeleteCompanies),
    map((action: DeleteCompanies) => action.payload),
    switchMap(config => {
      return this._http.delete(APIUrls.DELETE_COMPANIES("company"), config).pipe(
        map((response) => {
            if (response.success) {
              this.createBasicNotification('success',MessagesMap.COMPANY_DELETED_SUCCESS);
              return new CompaniesDeleted({
                success: true,
                message: {
                  value: MessagesMap.COMPANY_DELETED_SUCCESS 
                },
                data:config.records
              });
            } else {
              this.createBasicNotification('error',response.errorDesc || response.error.message || MessagesMap.COMPANY_DELETE_ERROR);
              return new CompaniesDeleteError({
                success: false,
                message: { value: response.errorDesc || response.error.message || MessagesMap.COMPANY_DELETE_ERROR}
              });
            }
        }));
    })
  );

    private createBasicNotification(type,message): void{
        this.notification.create(type,'', message, [],{nzDuration:3000});
    }

  @Effect() CreateCompany$ = this.actions$.pipe(
    ofType(CompaniesActionTypes.CreateCompany),
    map((action: CreateCompany) => action.payload),
    switchMap(config => {
      const clonedConfig = cloneDeep(config);
      CompanyUpsertUtils.formUpdatePayload(clonedConfig);
      return this._http.post(APIUrls.CREATE_COMPANY, {records: [clonedConfig.value]}).pipe(
        map(v =>{
          if (v.success) {
            return new UpsertCompanySuccess({
              success: true,
              message: {
                value: MessagesMap.COMPANY_CREATE_SUCCESS
              }
            });
          } else {
            return new UpsertCompanyError({
              success: false,
              message: {
                value: v.errorDesc || v.error.message || MessagesMap.COMPANY_CREATE_ERROR 
              }
            });
          }
        }));
    })
  );

  @Effect() UpdateCompany$ = this.actions$.pipe(
    ofType(CompaniesActionTypes.UpdateCompany),
    map((action: UpdateCompany) => action.payload),
    switchMap(config => {
      const clonedConfig = cloneDeep(config);
      CompanyUpsertUtils.formUpdatePayload(clonedConfig);
      return this._http.put(APIUrls.UPDATE_COMPANY, {records: [clonedConfig.value]}).pipe(
        map((v:any) =>{
          if (v.success) {
            return new UpsertCompanySuccess({
              success: true,
              message: {
                value: MessagesMap.COMPANY_UPDATE_SUCCESS
              }
            });
          } else {
            return new UpsertCompanyError({
              success: false,
              message: {
                value: v.error.localizedMessage ||  v.errorDesc || v.error.message || MessagesMap.COMPANY_UPDATE_ERROR 
              }               
            });           
          }      
        }));
    })   
  ); 


  constructor(
    private actions$: Actions,
    private _http: HttpProxyService,
    private _ds: DescribeService,
    private companiesFacade: CompaniesFacade,
    private notification: NzNotificationService
  ) {}
}
