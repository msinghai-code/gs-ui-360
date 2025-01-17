    /**
 * created by rpal on 22 jun 2021
 */

import {Inject, Injectable} from "@angular/core";
import { compareFields } from "@gs/gdk/utils/field";
import {HttpProxyService} from "@gs/gdk/services/http";
import {Observable, of, BehaviorSubject} from "rxjs";
import {isEmpty, uniqWith} from "lodash";
import {map, catchError, tap} from "rxjs/operators";
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { API_ENDPOINTS } from '@gs/cs360-lib/src/common';
import { EnvironmentService, UserService } from "@gs/gdk/services/environment";

@Injectable({
    providedIn: 'root'
})
export class CsmRelationshipService {

    protected cache: any = {};
    public customPaginatorData: any = {};
    public stateData: any = new BehaviorSubject({});
    currentData = this.stateData.asObservable();
    constructor(private http: HttpProxyService,
                @Inject("envService") public env: EnvironmentService,
                private userService: UserService,
                @Inject(CONTEXT_INFO) public ctx) {
    }

    /**
     * Fetch all relationship types with existing relationships
     */
    fetchAllRelationshipTypes(): Observable<any> {
        const GS: any = this.env.gsObject;
        return this.http.get(`v1/galaxy/relationship/type?companyId=${this.ctx.cId}`)
            .pipe(
                map(response => response.data),
                catchError(_ => of({}))
            )
    }

    fetchRelationshipsConfigByTypeId(relTypeId: string = 'ALL', referenceId: string) {
        relTypeId = relTypeId === "ALL" ? 'default': relTypeId;
        return this.http.get(`v2/galaxy/relationship/view/config/byRelTypeId/${relTypeId}/${referenceId}`)
            .pipe(
                map(response => response.data),
                catchError(_ => of({}))
            )
    }

    fetchRelationshipsListViewData(payload: any) {
        const companyId: string = this.ctx.cId;
        return this.http.post(`v2/galaxy/cr360/data/relationship/attributes/${companyId}`, payload)
            .pipe(
                map(response => response.data),
                catchError(_ => of({}))
            )
    }

    saveRelationship(payload) {
        return this.http.post(`v1/data/objects/relationship`, payload)
            .pipe(
                map(response => response.data),
                catchError(_ => of({}))
            )
    }

    updateRelationship(payload) {
        return this.http.put(`v1/data/objects/relationship?keys=Gsid`, payload)
            .pipe(
                map(response => response.data),
                catchError(_ => of({}))
            )
    }

    deleteRelationship(relId: string) {
        return this.http.delete(`v1/data/objects/relationship/${relId}`)
            .pipe(
                map(response => response.data),
                catchError(_ => of({}))
            )
    }

    getCompanyFilters(payload: any): Promise<any> {
        return this.http.post('v2/galaxy/transform/filter/company', payload)
            .pipe(
                map(config => config.data)
            ).toPromise();
    }

    getFilterFieldsFromDefaultConfig(): Promise<any[]> {
        if(!isEmpty(this.cache) && !!this.cache.filterFields) {
            return new Promise<any[]>(res => res(this.cache.filterFields));
        }
        return this.http.get(`v2/galaxy/relationship/view/config/byRelTypeId/default`)
            .pipe(
                map(response => {
                    if(response.data && response.data.list && response.data.card) {
                        const { list = [], card = [] } = response.data;
                        const allFields = uniqWith([...list, ...card], compareFields);
                        return allFields;
                    }
                }),
                tap(fields => this.cache.filterFields = fields),
                catchError(_ => of([]))
            ).toPromise();
    }

    saveColumnState(payload: any): Observable<any> {
        const { userId, id } = !isEmpty(this.userService.gsUser) ? this.userService.gsUser: this.env.user;
        return this.http.post(API_ENDPOINTS.SECTION_STATE, {...payload, userId: userId || id})
            .pipe(
                map(response => response.data),
                catchError(_ => of([]))
            );
    }

    getCustomPaginatorData(data){
        this.customPaginatorData = data;
        return this.customPaginatorData;
    }

}
