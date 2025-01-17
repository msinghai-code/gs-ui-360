import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { DescribeService } from "@gs/gdk/services/describe";
import {HttpProxyService} from "@gs/gdk/services/http";
import { Observable, of, forkJoin } from 'rxjs';
import { CompanyUpsertUtils } from './CompanyUpsertUtils';
import {
  APIUrls,
  MDA_HOST,
  CompanyUpsertResolverMessagesMap,
  COMPANY_OBJECT_NAME
} from './constants';
import { CompanyUpsertResolverResponse } from './interfaces';
import { cloneDeep } from 'lodash';

@Injectable()
export class CompanyUpsertResolverService implements Resolve<CompanyUpsertResolverResponse> {
  constructor(
    private _ds: DescribeService,
    private _http: HttpProxyService,
  ) {}

  read(recordId) {
    return this._http.get(APIUrls.GET_COMPANY_INFO(recordId));
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const recordId = route.queryParams.id;
    const redirectUrl = (window['urlParams'] || {}).redirectUrl;
      const host = MDA_HOST;
      const dataReq = !recordId
        ? of({ success: true, data: { records: [{}] } })
        : this.read(recordId);
      const schemaReqObservable = new Observable(observer => {
        this._ds
          .getDescribedObject(host, COMPANY_OBJECT_NAME, false, false, true)
          .then(v => {
            if (v) observer.next(v);
            else
              observer.next({
                data: null,
                success: false,
                error: {
                  message: CompanyUpsertResolverMessagesMap.SCHEMA_NOT_FOUND,
                  ok: false
                }
              });
            observer.complete();
          });
      });
      const finalObservable = new Observable(observer => {
        forkJoin([schemaReqObservable, dataReq]).subscribe((arr: any) => {
          const _schema = cloneDeep(arr[0]);
          const res = cloneDeep(arr[1]);
          if (_schema) {
            if (res.success) {
              if (res.data.records.length > 0) {
                const payload = {
                  objectDefinition: CompanyUpsertUtils.regroupFields(_schema),
                  objectName: _schema.objectName,
                  recordId,
                  editable: _schema.dataEditability === "EDITABLE",
                  data: CompanyUpsertUtils.remapAllFieldsData(
                    _schema,
                    res.data.records[0]
                  ),
                  schema: _schema,
                  redirectUrl,
                  editsAllowed: CompanyUpsertUtils.getEditFields(
                    _schema,
                    _schema.dataEditability === "EDITABLE"
                  )
                };
                observer.next(payload);
                observer.complete();
              } else {
                observer.next({
                  error: true,
                  message: CompanyUpsertResolverMessagesMap.COMPANY_NOT_FOUND
                });
                observer.complete();
              }
            } else {
              observer.next({
                message: res.error,
                error: true
              });
              observer.complete();
            }
          } else {
            observer.next({
              error: true,
              message: !_schema
                ? CompanyUpsertResolverMessagesMap.COMPANY_DATA_NOT_FOUND
                : res.error
                  ? res.error.message
                  : CompanyUpsertResolverMessagesMap.UNKNOWN_ERROR
            });
            observer.complete();
          }
        });
      });
      return finalObservable;
  }
}
