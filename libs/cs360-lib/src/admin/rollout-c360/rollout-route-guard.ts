import { Inject, Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { Observable, of } from "rxjs";
import { isEmpty } from "lodash";
import { switchMap, tap } from "rxjs/operators";
import {HttpProxyService} from "@gs/gdk/services/http";
import { API_ENDPOINTS, APPLICATION_ROUTES, FEATURE_TOGGLES } from "@gs/cs360-lib/src/common";
import {EnvironmentService} from "@gs/gdk/services/environment";

@Injectable()
export class CS360AdminRolloutGuard implements CanActivate {

  constructor(private router: Router, private httpProxyService: HttpProxyService, @Inject("envService") private env: EnvironmentService) { }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const stateResponse = this.router.getCurrentNavigation().extras.state;
    return new Observable(observer => {
      this.getFeatureToggleInformation().subscribe((response) => {
        if(!this.isRolloutEnabled() ) {
          if((stateResponse && stateResponse.MigrationStatus !== "MIGRATION_READY") || !stateResponse){
            this.router.navigateByUrl(APPLICATION_ROUTES.STANDARD_LAYOUTS);
          } else {
            observer.next(true);
            observer.complete();
          }    
        } 
        else {
          observer.next(true);
          observer.complete();
        }
      });
    });
  }

  isRolloutEnabled(): boolean {
    // return ["MIGRATION_READY"].includes(this.env.getFeatureFlag('C360_REVAMP'));
      const featureFlags = this.env.gsObject.featureFlags;
      const c360Revamp =  featureFlags && featureFlags['C360_REVAMP'];
      return ["MIGRATION_READY"].includes(c360Revamp);
  }

  // Make fresh API call to get the FT status (instead of relying on GS.featureFlags) and also update the GS.featureFlags
  getFeatureToggleInformation() {
    return this.httpProxyService.post(API_ENDPOINTS.GET_FEATURE_CONFIG, ['C360_REVAMP']).pipe(
      switchMap((response) => {
        return response.result ? of(response) : of({});
      }),
      tap(response => {
        const GS = this.env.gsObject;
        if(!GS || !GS.featureFlags || !response || !response.data || !response.data[0] || !response.data[0].value) { return; }

        GS.featureFlags['C360_REVAMP'] = response.data[0].value;
      })
    );
  }
}
