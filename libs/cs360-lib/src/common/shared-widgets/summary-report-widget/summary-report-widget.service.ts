/**
 * created by rpal on 09 sep 2021
 */

import {Injectable} from "@angular/core";
import { ReportFilterUtils} from "@gs/report/utils";
import {HttpProxyService} from "@gs/gdk/services/http";
import {catchError, map} from "rxjs/operators";
import {of} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SummaryReportWidgetService {

    constructor(private http: HttpProxyService) {}

    getCompanyFilters(payload: any): Promise<any> {
        return this.http.post('v2/galaxy/transform/filter/company', payload)
            .pipe(
                map(config => config.data)
            ).toPromise();
    }
    getPersonFilters(payload: any): Promise<any> {
        return this.http.post('v2/galaxy/transform/filter/person', payload)
            .pipe(
                map(config => config.data)
            ).toPromise();
    }

    getRelationshipFilters(payload: any): Promise<any> {
        return this.http.post('v2/galaxy/transform/filter/relationship', payload)
            .pipe(
                map((config: any) => {
                    if(!!config.data) {
                        return { error: false, data: config.data };
                    } else if(!!config.error) {
                        return { error: true, data: config.error };
                    } else {
                        return { error: false, data: ReportFilterUtils.emptyFilters() };
                    }
                }),
                catchError(_ => of(ReportFilterUtils.emptyFilters()))
            ).toPromise();
    }

}
