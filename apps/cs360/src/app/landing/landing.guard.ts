import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Resolve, Router, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { find, size } from 'lodash';
import { CONTEXT_INFO } from "@gs/cs360-lib/src/common";
import {EnvironmentService} from "@gs/gdk/services/environment";

@Injectable()
export class CS360LandingRouteGuard implements CanActivate {
  constructor(private router: Router, @Inject("envService") private env: EnvironmentService, @Inject(CONTEXT_INFO) public ctx) { }
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.ctx.error) {
      return true;
    }
    const moduleConfig = this.env.moduleConfig;
    const section = find(moduleConfig.sections, (s) => s.sectionId === route.params.sectionId);
    if (!section && size(moduleConfig.sections)) {
      this.router.navigate(['/' + moduleConfig.sections[0].sectionId]);
      return false;
    } else {
      return true;
    }
  }
}
