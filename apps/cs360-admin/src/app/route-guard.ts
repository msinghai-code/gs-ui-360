import { Inject, Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { forkJoin, Observable } from "rxjs";
import { isEmpty } from "lodash";
import { of } from 'rxjs';
import { switchMap, tap } from "rxjs/operators";
import {API_ENDPOINTS, APPLICATION_ROUTES, PageContext, FEATURE_TOGGLES, CS360Service} from "@gs/cs360-lib/src/common";
import { EnvironmentService } from "@gs/gdk/services/environment";
import { HttpProxyService } from "@gs/gdk/services/http";

@Injectable()
export class CS360AdminRouteGuard implements CanActivate {

  constructor(private router: Router, @Inject("envService") public env: EnvironmentService, private httpProxyService: HttpProxyService, private cs360: CS360Service) { }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Observable(observer => {
      forkJoin([this.getConfig(), this.getFeatureToggleInformation()]).subscribe((response: any[]) => {
        if (response[0]) {
          const moduleConfig = this.env.moduleConfig;
          this.env.moduleConfig ={ ...moduleConfig, ...response[0]};
          if(this.isRolloutEnabled()) {
            observer.next(false);
            observer.complete();
            this.router.navigateByUrl(APPLICATION_ROUTES.ADMIN_ROLLOUT);
          }
          else if(this.isRevampEnabled()) {
            observer.next(true);
            observer.complete();
          } else {
            this.router.navigateByUrl(APPLICATION_ROUTES.FEATURE_DISBALED);
          }
        } else {
          this.router.navigateByUrl(APPLICATION_ROUTES.FEATURE_DISBALED);
        }
      });
    });
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

  isRolloutEnabled(): boolean {
    // return ["MIGRATION_READY"].includes(this.env.getFeatureFlag('C360_REVAMP'));
      const featureFlags = this.env.gsObject.featureFlags;
      const c360FeatureFlags =  featureFlags && featureFlags['C360_REVAMP'];
      return ["MIGRATION_READY"].includes(c360FeatureFlags);
  }

  isRevampEnabled(): boolean {
    // return !["DISABLED"].includes(this.env.getFeatureFlag('C360_REVAMP'));
      const featureFlags = this.env.gsObject.featureFlags;
      const c360FeatureFlags =  featureFlags && featureFlags['C360_REVAMP'];
      return !["DISABLED"].includes(c360FeatureFlags);
  }

  getConfig() {
    const featureFlags = this.env.gsObject.featureFlags;
    let areaName = PageContext.C360.toLowerCase() ;
    if(featureFlags['PARTNER_MANAGEMENT']) {
      const queryParams = this.router.getCurrentNavigation().extractedUrl.queryParams;
      const primary = this.router.getCurrentNavigation().extractedUrl.root.children.primary;
      let segments = primary ? primary.segments : null;
      if((queryParams.managedAs && queryParams.managedAs === "partner") || (segments && segments[0] && segments[0].path === "partner")) {
        areaName = 'partner_' + areaName;
      }
    }
    return this.httpProxyService.get(API_ENDPOINTS.GET_ADMIN_BOOTSTRAP(areaName)).pipe(switchMap((response) => {
      let config;
      if (response.result) {
        const { data: bootstrapConfig } = response;
        config = { ...bootstrapConfig };
      } else {
        this.validate(response.data);
      }
      return of(config);
    }));
  }

  validate(config: any) {
    return true;
    // if (config && !config.IS_ENABLED) {
    //   //todo add route
    //   this.router.navigateByUrl(`/feature-disabled`);
    //   return false;
    // }
    // return !isEmpty(config);
  }

}
