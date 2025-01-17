import { Injectable } from '@angular/core';
import {HttpProxyService} from "@gs/gdk/services/http";
import { of, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { API_ENDPOINTS } from '@gs/cs360-lib/src/common';

@Injectable({
  providedIn: 'root'
})
export class RolloutC360Service {

  constructor(private http: HttpProxyService) { }

  startMigration(queryParams?) {
    return this.http.post(API_ENDPOINTS.TRIGGER_MIGRATION(queryParams), {})
        .pipe(
            map(response => response)
        );
  }

  activateCS360(payload: any): Observable<any> {
    return this.http.post(API_ENDPOINTS.ROLLOUT_ACTIVATION, payload)
              .pipe(
                  map(response => response.data)
              );
  }

    getFeatureToggleInformation() {
        return this.http.post(API_ENDPOINTS.GET_FEATURE_CONFIG, ["C360_REVAMP"])
            .pipe(
                map(response => response.data)
            );
    }

  refreshFeatureFlagsOnServer() {
    return this.http.get('v1/ui/app/refresh');
  }
}
