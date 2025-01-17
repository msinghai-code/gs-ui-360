import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from "rxjs";
import { cloneDeep, orderBy, filter, isEmpty } from "lodash";
import { map, publishReplay, refCount, tap } from 'rxjs/operators';
import { GlobalFilterCondition } from "@gs/gdk/filter/global/core/global-filter.interface";
import { GSField } from "@gs/gdk/core";
import { DescribeService } from "@gs/gdk/services/describe";
import {HttpProxyService} from "@gs/gdk/services/http";
import { API_URLS } from "../../layout-configuration.constants";

export interface AssignmentCondition extends GlobalFilterCondition {
  describeField?: GSField;
  value?: any
  dateLiteral?: string;
  userLiteral?: string;
  currencyCode?: string;
}

enum ManageAssignmentsCacheEnum {
  LAYOUTS = "layouts"
}

@Injectable({
  providedIn: 'root'
})
export class ManageAssignmentService {

  private manageAssignmentsCache = {};

  constructor(
    private http: HttpProxyService,
    private ds: DescribeService
  ) {
  }

  fetchAssignments(options: any): Observable<any> {
    if (this.manageAssignmentsCache[ManageAssignmentsCacheEnum.LAYOUTS]) {
      return of(orderBy(this.manageAssignmentsCache[ManageAssignmentsCacheEnum.LAYOUTS], ['displayOrder'], ['asc']));
    }
    const { sharingType, entityType, isPartner } = options;
    let url = API_URLS.LAYOUT_LISTING.MANAGE_ASSIGNMENT(sharingType, entityType);
    if(isPartner) {
      url = url + "?managedAs=partner"
    }
    return this.http.get(url)
      .pipe(
        map(response => response.data),
        publishReplay(1),
        refCount(),
        tap(data => this.updateCache(ManageAssignmentsCacheEnum.LAYOUTS, cloneDeep(data)))
      );
  }

  search(payload): Observable<any> {
    return this.http.post(API_URLS.UTILS.LOOKUP_SEARCH, payload).pipe(
      map((res) => {
        return res.success ? (res.data || []).reduce((r, c) => [...r, ...c.results], []) : [];
      }));
  }

  invalidateCache() {
    this.manageAssignmentsCache = {};
  }

  reorderLayouts(payload: any): Observable<any[]> {
    return this.http.post(API_URLS.LAYOUT_LISTING.SAVE_LAYOUT_ORDER, payload)
      .pipe(
        map(response => response.data),
        publishReplay(1),
        refCount(),
        tap(data => {
          this.manageAssignmentsCache[ManageAssignmentsCacheEnum.LAYOUTS].forEach(layout => {
            layout.displayOrder = data[layout.layoutId];
          });
        })
      );
  }

  getLayout(entityId, userId, entityType, isPartner?: boolean) {
    const request = {
      [entityType + "Id"]: entityId,
      // TODO make it generic, for now proceeding with this
      entityId,
      userId,
      entityType,
      sharingType: "INTERNAL",
    };
    let url = API_URLS.LAYOUT_ASSIGN.ASSIGNMENT_PREVIEW;
    if(isPartner) {
      url = url + "?managedAs=partner"
    }
    return this.http.post(url, request).pipe(
      map(response => response.data)
    );
  }

  fetchRelationShipAdvanceLookup(fieldValues) {
    const selectFields = ["Name", "Gsid"];
    const searchFields = ["TypeId", "Name"];
    const toReturn = new BehaviorSubject(null);
    this.ds.getDescribedObject(
      { id: 'MDA', type: 'MDA', name: 'MDA' },
      'relationship'
    ).then(relationShipObject => {
      const { source, dbName, dataStore, fields: relationShipFields } = relationShipObject;
      const columns = selectFields.map((field, i) => {
        let { meta, ...matchedField } = relationShipFields.find(rf => rf.fieldName === field);
        return { 
          ...matchedField,
          fieldAlias: matchedField.fieldName,
          type: "MEASURE"
        };
      });
      const expressionAr = [];
      const conditions = searchFields.map((sf, i) => {
        let { meta, ...matchedField } = relationShipFields.find(rf => rf.fieldName === sf);
        expressionAr.push(String.fromCharCode(97 + i).toUpperCase());
        return {
          leftOperand: {
            ...matchedField,
            type: "BASE_FIELD"
          },
          filterAlias: expressionAr[i],
          comparisonOperator: sf === 'TypeId' ? "EQ" : "CONTAINS",
          rightOperandType: "VALUE",
          filterValue: {
            value: [
              fieldValues[matchedField.fieldName]
            ]
          }
        }
      });

      const request = {
        columns,
        whereClause: {
          conditions,
          expression: `(${expressionAr.join(" AND ")})`
        },
        objectName: dbName,
        source,
        dataStore,
        "connectionId": null
      };

      //API_URLS.UTILS.ADVANCE_LOOKUPSEARCH
      this.http.post("v1/api/describe/advancedlookupsearch", request).subscribe(res => {
        toReturn.next(res);
      });
    })
    return toReturn.asObservable();
  }

  private updateCache(property: string, data: any) {
    this.manageAssignmentsCache[property] = data;
  }

}
