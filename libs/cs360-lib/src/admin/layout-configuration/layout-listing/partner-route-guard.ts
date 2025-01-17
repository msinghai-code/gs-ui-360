import { Inject, Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { Observable, of } from "rxjs";
import { EnvironmentService } from "@gs/gdk/services/environment";
import { PageContext } from "@gs/cs360-lib/src/common";
import { HttpProxyService } from "@gs/gdk/services/http";
import { switchMap } from "rxjs/operators";
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO, API_ENDPOINTS, APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';

@Injectable()
export class PartnerRouteGuard implements CanActivate {

  constructor(private router: Router, @Inject("envService") public env: EnvironmentService, 
              private httpProxyService: HttpProxyService,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO) { }

  public isPartner: boolean = null;

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.env.gsObject.featureFlags['PARTNER_MANAGEMENT'] && this.ctx.isPartnerUsecaseSupported) {
        let areaName = 'partner_' + this.ctx.pageContext.toLowerCase();
        this.httpProxyService.get(API_ENDPOINTS.GET_ADMIN_BOOTSTRAP(areaName)).pipe(switchMap((response) => {
            let config;
            if (response.result) {
              const { data: bootstrapConfig } = response;
              config = { ...bootstrapConfig };
            }
            return of(config);
        })).subscribe((config) => {
            if(config) {
              const moduleConfig = this.env.moduleConfig;
              this.env.moduleConfig = { ...moduleConfig, ...config };
            }
        });

        return true;
    } else {
        this.router.navigateByUrl(APPLICATION_ROUTES.FEATURE_DISBALED);
    }
  }

}
