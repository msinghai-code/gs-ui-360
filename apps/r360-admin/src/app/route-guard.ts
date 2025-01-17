import { Inject, Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { forkJoin, Observable } from "rxjs";
import { HttpProxyService } from "@gs/gdk/services/http";
import { of } from 'rxjs';
import { isEmpty } from "lodash";
import { switchMap, tap } from "rxjs/operators";
import { API_ENDPOINTS, APPLICATION_ROUTES } from "@gs/cs360-lib/src/common";
import {EnvironmentService} from "@gs/gdk/services/environment";

@Injectable()
export class R360AdminRouteGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject("envService") private env: EnvironmentService,
    private httpProxyService: HttpProxyService,
    private http: HttpProxyService
  ) { }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Observable(observer => {
      forkJoin([this.getConfig(), this.getRelationshipTypes(), this.getFeatureToggleInformation()]).subscribe(([config, relTypes]) => {
        if (config) {
          const moduleConfig = this.env.moduleConfig;
          // Added ctxEntityTypes as an alternative to relationshipTypes as part of generic platform changes. 
          // TODO: Remove relatioshipTypes once changes are stable.
          this.env.moduleConfig ={ ...moduleConfig, ...config, relationshipTypes: relTypes, ctxEntityTypes: relTypes };
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

  private getRelationshipTypes() {
    return this.httpProxyService.get(API_ENDPOINTS.GET_RELATIONSHIP_TYPES).pipe(switchMap((response) => {
      let relTypes;
      if (response.result) {
        relTypes = response.data;
      } else {
        relTypes = [];
      }
      return of(relTypes);
    }));
  }

  getConfig() {
    const featureFlags = this.env.gsObject.featureFlags;
    let areaName = 'r360';
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
      }
      return of(config);
    }));
  }
}
