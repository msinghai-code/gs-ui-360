import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {HttpProxyService} from "@gs/gdk/services/http";
import { Observable, of } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';
import { CS360CacheService } from '@gs/cs360-lib/src/common';
import { API_ENDPOINTS } from '@gs/cs360-lib/src/common';

@Injectable()
export class GlobalSectionResolverService implements Resolve<any> {
    constructor(private http: HttpProxyService) { }
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        // we need to change to route.parent.parent in case of lazy-loading. 
        //Since we moved one level of routing from lib to app, one level of parent works now.
        const { params: { layoutId, sectionId } } = route.parent;
        if(!!layoutId) {
            return this.http.get(API_ENDPOINTS.GET_SECTON(layoutId, sectionId)).pipe(map(response => {
                return { ...response.data, layoutId };
            }));
        } else {
            return this.http.get(API_ENDPOINTS.GET_GLOBAL_SECTION(sectionId)).pipe(map(response => {
                return { ...response.data, sectionId };
            }));
        }
    }
}


