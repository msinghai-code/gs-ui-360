/**
 * created by rpal on jun 9, 2021.
 */

import {Inject, Injectable} from "@angular/core";
import {HttpProxyService} from "@gs/gdk/services/http";
import {Observable, of} from 'rxjs';
import {catchError, map} from "rxjs/operators";
import {isEmpty} from "lodash";
import {API_ENDPOINTS, PageContext} from './../../cs360.constants';
import { EnvironmentService, UserService } from "@gs/gdk/services/environment";

@Injectable({
    providedIn: 'root'
})
export class SectionStateService {

    constructor(private http: HttpProxyService,
               @Inject("envService") public env: EnvironmentService,
               private userService: UserService) { }


    getState(layoutId: string, sectionId: string, moduleName?): Observable<any> {
        const { userId, id } = !isEmpty(this.userService.gsUser) ? this.userService.gsUser: this.env.user;
        const referenceId: string = `${layoutId}_${sectionId}`;
        let url = `${API_ENDPOINTS.SECTION_STATE}?moduleName=${moduleName}&referenceId=${referenceId}`;
        return this.http.get(url)
            .pipe(
                map(response => response.data),
                catchError(_=>of({}))
            );
    }

    getAdminPreviewState(layoutId: string, sectionId: string, moduleName?): Observable<any> {
        const {userId, id} = !isEmpty(this.userService.gsUser) ? this.userService.gsUser : this.env.user;
        const referenceId: string = `${layoutId}_${sectionId}`;
        return this.http.get(`${API_ENDPOINTS.GET_ADMIN_SECTION_PREVIEW_STATE}/${userId || id}/${referenceId}`)
            .pipe(
                map(response => response.data),
                catchError(_ => of({}))
            );
    }

    getStateForAdmin(referenceId: string): Observable<any> {
        const { userId, id } = !isEmpty(this.userService.gsUser) ? this.userService.gsUser: this.env.user;
        return this.http.get(`${API_ENDPOINTS.SECTION_STATE}/${userId || id}/${referenceId}`)
            .pipe(
                map(response => response.data),
                catchError(_=>of({}))
            );
    }

    getAdminLevelState(referenceId: string): Observable<any> {
        const moduleName = 'c360';
        return this.http.get(`${API_ENDPOINTS.SECTION_STATE}?moduleName=${moduleName}&referenceId=${referenceId}`)
            .pipe(
                map(response => response.data),
                catchError(_=>of({}))
            );
    }

    saveState(payload) {
        const { userId, id } = !isEmpty(this.userService.gsUser) ? this.userService.gsUser: this.env.user;
        return this.http.put(API_ENDPOINTS.SAVE_SECTION_STATE, {...payload, userId: userId || id})
            .pipe(
                map(response => response.data),
                catchError(_=>of({}))
            );
    }

    deleteState() {
        // return this.http.delete()
    }

}
