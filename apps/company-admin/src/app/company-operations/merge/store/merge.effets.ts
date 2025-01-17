import { Actions, Effect, ofType } from '@ngrx/effects';
import { Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import {
  LoadCompanyDataSuccess,
  LoadLoadCompanyDataFail,
  LoadCompanyData,
  MergeActions,
  MergeCompany,
  MergeCompanySuccess,
  MergeCompanyFailure,
  DescribeObject,
  DescribeObjectSuccess,
  DescribeObjectFail,
  LoadCompanyList,
  LoadCompanyListSuccess,
  LoadCompanyListFail
} from './merge.actions';
import { map, switchMap, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { MergeState } from './merge.reducers';
import { APIUrls, COMPANY_OBJECT_NAME } from '../../constants';
import {HttpProxyService} from "@gs/gdk/services/http";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { GSWindow } from '@gs/gdk/core/types';
import {NzNotificationService} from "@gs/ng-horizon/notification";
declare let window: GSWindow;

@Injectable()
export class MergeEffects {


  constructor(
    private actions$: Actions,
    private _httpProxy: HttpProxyService,
    private notification: NzNotificationService,
    private store : Store<MergeState>,
    @Inject("envService") public _env: EnvironmentService ) {
  }


  @Effect()
  loadCompany$ = this.actions$.pipe(
    ofType(MergeActions.LOAD_COMPANY_DATA),
    map((action: LoadCompanyData) => action.payload),
    switchMap((data) => {
        return this._httpProxy.post(APIUrls.GET_COMPANY_FIELDS, data).pipe(
          map((response: any) => {
            if (response.success) {
              if(response.data.length === 2){
                this.store.dispatch(new DescribeObject("company"));
                return new LoadCompanyDataSuccess(response.data);
              }else{
                // this._snackBar.open("Selected companies are already in a merge process. Please select different companies.", '', { duration: 3000 });
                  this.notification.create('info','', "Selected companies are already in a merge process. Please select different companies.", [],{nzDuration:3000})
                return new MergeCompanyFailure();
              }
            } else {
              // this._snackBar.open("No data", '', { duration: 3000 });
                this.notification.create('info','', "No data", [],{nzDuration:3000})
              return new LoadLoadCompanyDataFail();
            }
          }));
      }
    ));

  @Effect()
  mergeCompany$ = this.actions$.pipe(
    ofType(MergeActions.MERGE_COMPANY),
    map((action: MergeCompany) => action.payload),
    switchMap((data) => {
        return this._httpProxy.post(APIUrls.MERGE_COMPANIES, data).pipe(
          map((response: any) => {
            if (response.success) {
              const responseData = response.data;
              const mergeId = responseData && responseData.mergeId;
              // this._snackBar.open(`Company Merge has been started with Merge Id : ${mergeId}`, '', { duration: 3000 });
                this.notification.create('success','', `Company Merge has been started with Merge Id : ${mergeId}`, [],{nzDuration:3000})
              return new MergeCompanySuccess({
                isInIFrame : window.urlParams.inFrame,
                data: responseData
              });
            } else {
              // this._snackBar.open("Failed to merge the companies", '', { duration: 3000 });
                this.notification.create('error','', "Failed to merge the companies", [],{nzDuration:3000})
              return new MergeCompanyFailure({
                isInIFrame : window.urlParams.inFrame
              });
            }
          }));
      }
    ));


    @Effect()
    describeObject$ = this.actions$.pipe(
      ofType(MergeActions.DESCRIBE_OBJECT),
      map((action: DescribeObject) => action.payload),
      switchMap((data) => {
          return this._httpProxy.get(APIUrls.DESCRIBE_OBJECT(COMPANY_OBJECT_NAME)).pipe(
            map((response: any) => {
              if (response.success) {
                return new DescribeObjectSuccess(response.data);
              } else {
                return new DescribeObjectFail();
              }
            }));
        }
      ));

  @Effect()
  loadCompanyList$ = this.actions$.pipe(
    ofType(MergeActions.LOAD_COMPANY_LIST),
    map((action: LoadCompanyList) => action.payload),
    switchMap((data) => {
        return this._httpProxy.post(APIUrls.GET_COMPANIES, data).pipe(
          map((response: any) => {
            if (response.success) {
              return new LoadCompanyListSuccess(response.data);
            } else {
              // this._snackBar.open("No data", '', { duration: 3000 });
                this.notification.create('info','', "No data", [],{nzDuration:3000})
              return new LoadCompanyListFail();
            }
          }));
      }
    ));

}
