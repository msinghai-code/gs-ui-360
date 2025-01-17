import { Inject, Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import {Observable, of} from "rxjs";
import { isEmpty } from "lodash";
import {CS360Service, ExternalAppsService} from "@gs/cs360-lib/src/common";
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {switchMap} from "rxjs/operators";

@Injectable()
export class CS360RouteGuard implements CanActivate {

  constructor(
    private router: Router,
    private cs360Service: CS360Service,
    private externalAppsService: ExternalAppsService,
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
  ) { }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

  const {cId, rId, aId, dId} = this.ctx;
  const fts = window.GS.featureFlags || {};
    return (
      ([cId, rId, aId, dId].every(id => !id) && fts.EXTERNAL_ID_FIELD) ?
        this.externalAppsService.getExternalFields(this.ctx.baseObject) : of([]))
      .pipe(switchMap(externalFields => {
        let paramsHasExternalId = false;
        if(externalFields && externalFields.length > 0) {
          const searchParams = new URLSearchParams(window.location.search);
          searchParams.forEach((value, key) => {
            if(!paramsHasExternalId) {
              paramsHasExternalId = externalFields.find(eF => eF.toUpperCase() === key.toUpperCase());
            }
          });
        }

        if([cId, rId, aId, dId].every(id => !id) && !paramsHasExternalId) {
          this.ctx.error  = "The company/relationship you are trying to look for doesn't exists.";
          this.ctx.errorType = 'COMPANY_OR_RELATIONSHIP_NOT_FOUND';
          return of(true);
        }
        return this.cs360Service.updateContextData(this.ctx, externalFields)
      }));
  }

  validate(config: any) {
    if (config && !config.IS_ENABLED) {
      this.router.navigateByUrl(`/feature-disabled`);
      return false;
    }
    return !isEmpty(config);
  }
}
