import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { HttpProxyService } from "@gs/gdk/services/http";
import { map, switchMap } from 'rxjs/operators';
import { NETWORK_ACCESS_CONSTS } from '../../network-access.constant';
import {
  NetworkaccessActionTypes,
  ConfigurationLoaded,
  LoadConfigurationFailed,
  ConfigurationUpserted,
  UpsertConfigurationFailed
} from './networkaccess.actions';
import { each, filter, cloneDeep } from 'lodash';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Injectable()
export class NetworkaccessEffects {
  constructor(
    private _http: HttpProxyService,
    private actions$: Actions,
    private i18nService: NzI18nService
  ) { }

  @Effect() loadNetworkaccess$ = this.actions$.pipe(ofType(NetworkaccessActionTypes.LoadAllConfiguration), map((action: any) => action),
    switchMap((action) => {
      return this._http.get(NETWORK_ACCESS_CONSTS.IP_FETCH_URL).pipe(
        map(response => {
          if (response && response.success) {
            return new ConfigurationLoaded(response.data);
          } else {
            return new LoadConfigurationFailed({
              message: { value: this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.FETCH_ERROR_MESSAGE') }
            });
          }
        })
      );
    }));

  @Effect() upsertConfiguration$ = this.actions$.pipe(ofType(NetworkaccessActionTypes.UpsertConfiguration), map((action: any) => action),
    switchMap((action) => {
      const data = action.payload.data;
      const stateData = cloneDeep(action.payload.stateData);
      let payload = {} as any;
      let successMessage = '';
      let errorMessage = '';
      switch (action.payload.action) {
        case 'ADD':
          successMessage = this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.ADD_SUCCESS_MESSAGE');
          errorMessage = this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.ADD_ERROR_MESSAGE');
          const ipAddress = data.address ? [
            { address: data.address, description: data.description }
          ] : [];
          if (stateData && Object.keys(stateData).length !== 0) {
            stateData.ipAddress = [...stateData.ipAddress, ...ipAddress];
            payload = stateData;
          } else {
            payload.version = NETWORK_ACCESS_CONSTS.VERSION;
            payload.notation = NETWORK_ACCESS_CONSTS.NOTATION;
            payload.ipAddress = ipAddress;
            payload.byPassMobile = data.byPassMobile;
          }
          break;
        case 'EDIT':
          const isByPassMobileChanged = stateData && stateData.byPassMobile != data.byPassMobile;
          successMessage = isByPassMobileChanged ? (data.byPassMobile ? this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.BYPASS_MOBILE_SUCCESS_MESSAGE') : this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.NOT_BYPASS_MOBILE_SUCCESS_MESSAGE')) : this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.UPDATE_SUCCESS_MESSAGE');
          errorMessage = this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.UPDATE_ERROR_MESSAGE');
          stateData.ipAddress = each(stateData.ipAddress, x => {
            if (x.address === data.oldIpAddress) {
              x.address = data.address;
              x.description = data.description;
            }
          });
          payload = stateData;
          payload.byPassMobile = data.byPassMobile;
          break;
        case 'DELETE':
          successMessage = this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.DELETE_SUCCESS_MESSAGE');
          errorMessage = this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.DELETE_ERROR_MESSAGE');
          if (stateData.ipAddress.length === 1 && stateData.ipAddress[0].address === data) {
            return this.deleteConfig(
              stateData.entityId,
              successMessage,
              errorMessage
            );
          } else {
            stateData.ipAddress = filter(
              stateData.ipAddress,
              x => x.address !== data
            );
            payload = stateData;
          }
          break;
      }
      return this.upsert(payload, successMessage, errorMessage);
    }
    ));

  upsert(payload, successMessage, errorMessage) {
    return this._http.post(NETWORK_ACCESS_CONSTS.IP_UPSERT_URL, payload).pipe(
      map(response => {
        if (response && response.success) {
          return new ConfigurationUpserted({
            message: { value: successMessage }
          });
        } else {
          return new UpsertConfigurationFailed({
            message: {
              value:
                response.error.message ||
                response.error.errorDesc ||
                errorMessage
            }
          });
        }
      })
    );
  }

  deleteConfig(value, successMessage, errorMessage) {
    const url = NETWORK_ACCESS_CONSTS.DELETE_CONFIGURATION(value);
    return this._http.delete(url).pipe(
      map(response => {
        if (response && response.success) {
          return new ConfigurationUpserted({
            message: { value: successMessage }
          });
        } else {
          return new UpsertConfigurationFailed({
            message: {
              value:
                response.error.message ||
                response.error.errorDesc ||
                errorMessage
            }
          });
        }
      })
    );
  }
}
