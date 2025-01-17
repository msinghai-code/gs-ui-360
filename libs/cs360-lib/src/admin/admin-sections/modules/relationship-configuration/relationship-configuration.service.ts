import {Inject, Injectable} from "@angular/core";
import {HttpProxyService} from "@gs/gdk/services/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {NzTreeNodeOptions} from '@gs/ng-horizon/core';
import {API_URLS} from "./relationship-configuration.constants";
import { EnvironmentService } from "@gs/gdk/services/environment";

@Injectable({
    providedIn: 'root'
})
export class RelationshipConfigurationService {

    constructor(private http: HttpProxyService, @Inject("envService") private env: EnvironmentService) { }

    fetchReports(): Observable<any> {
        const payload: any = this.getRelationshipReportsPayload();
        return this.http.post(API_URLS.GET_ALL_RELATIONSHIP_REPORTS, payload)
            .pipe(
                map(response => {
                    const { data = [] } = response;
                    return this.convertReportListToTreeContract(data);
                })
            )
    }

    convertReportListToTreeContract(reportList: any[]): NzTreeNodeOptions[] {
        return reportList.map(report => {
            return {
                title: report.name,
                key: report.reportId,
                isLeaf: true,
                checked: false,
                selectable: false,
                meta: report
            }
        });
    }

    getSectionDetails(configDetails: any): Observable<any> {
        const { layoutId, sectionId } = configDetails;
        return this.http.get(API_URLS.GET_SECTION_DETAILS(layoutId, sectionId))
            .pipe(
                map(config => config.data)
            )
    }

    private getRelationshipReportsPayload(): any {
        return {
            "fields": [
                {
                    "fieldName": "name"
                }
            ],
            "searchConfiguration":{"sourceObject":{"value":["relationship"],"operator":"IN"}}
        };
    }

}
