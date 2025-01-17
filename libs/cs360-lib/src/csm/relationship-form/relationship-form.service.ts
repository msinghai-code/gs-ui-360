import {Inject, Injectable} from '@angular/core';
import {HostInfo} from "@gs/gdk/core";
import { DescribeService } from "@gs/gdk/services/describe";
import {HttpProxyService} from "@gs/gdk/services/http";
import { EnvironmentService } from '@gs/gdk/services/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
// import { getFieldWithMapping } from '../field-selector-dropdown/field-selector-dropdown.utils';
import { get, uniq } from 'lodash';
import { Cs360ContextUtils, getFieldWithMapping } from '@gs/cs360-lib/src/common';
import { TranslocoService } from '@ngneat/transloco';


@Injectable({
  providedIn: 'root'
})
export class RelationshipFormService {

  constructor(private http: HttpProxyService,
              private _ds: DescribeService,
              private translocoService: TranslocoService,
              @Inject("envService") public env: EnvironmentService) { }

  getAllRelationshipTypes(): Observable<any> {
    return this.http.get('v1/galaxy/relationship/type')
        .pipe(
            map(response => response.data)
        );
  }

  getRelationshipConfigByRelTypeId(relTypeId: string): Observable<any> {
    relTypeId = relTypeId === "ALL" ? 'default': relTypeId;
    return this.http.get(`v2/galaxy/relationship/view/config/byRelTypeId/${relTypeId}`)
        .pipe(
            map(response => response.data)
        );
  }

  getEditRelationshipTypeAttributes(relTypeId: string, relId: string): Observable<any> {
    relTypeId = relTypeId === "ALL" ? 'default': relTypeId;
    return this.http.get(`v2/galaxy/cr360/data/relationship/attributes/${relTypeId}/${relId}`)
        .pipe(
            map(response => response.data)
        );
  }

  getAddRelationshipTypeAttributes(relTypeId: string): Observable<any> {
    relTypeId = relTypeId === "ALL" ? 'default': relTypeId;
    return this.http.get(`v2/galaxy/cr360/data/relationship/attributes/${relTypeId}`)
        .pipe(
            map(response => response.data)
        );
  }

  describeRelationship(host: HostInfo): Promise<any> {
    return this._ds.getDescribedObject(host, host.name, false, false, true, false, 0, false);
  }

  /**
   * Get company and type data based on lookupDisplayField configuration present in iFields.
   * Note that iFields might have company or type or both or none
   * @returns object of type:
   * {
   *    CompanyId: {
   *      fv: '', k: '', v: ''
   *    },
   *    TypeId: {
   *      fv: '', k: '', v: ''
   *    }
   * }
   */
  async getCompanyAndTypeData(iFields = [], companyId: string, typeId: string): Promise<any> {
    if(!iFields.length) {
      return;
    }

    const query = [];
    
    // If companyId field is present, prepare query
    const companyIdField = iFields.find(f => getFieldWithMapping(f, "GS_COMPANY_ID"));
    const companyLookupDisplayFieldName = get(companyIdField, 'lookupDisplayField.fieldName');
    if(companyIdField) {
      query.push(this.getSearchQuery(companyLookupDisplayFieldName, companyId, 'company'));
    }

    // If typeId field is present, prepare query
    const typeIdField = iFields.find(f => getFieldWithMapping(f, "GS_RELATIONSHIP_TYPE_ID"));
    const relLookupDisplayFieldName = get(typeIdField, 'lookupDisplayField.fieldName');
    if(typeIdField) {
      query.push(this.getSearchQuery(relLookupDisplayFieldName, typeId, 'relationship_type'));
    }
    
    if(!query.length) {
      return null;
    }

    return this.http.post('v1/api/describe/lookupsearch', query)
      .pipe(
        map(res => {

          if(!res.result) {
            return;
          }

          const result: any = {};

          res.data.forEach(item => {
            const data = item.results[0];
            if(item.object === 'company') {
              result.CompanyId = {
                fv: companyLookupDisplayFieldName ? data[companyLookupDisplayFieldName.toLowerCase()] || '---' : data.gsid,
                k: data.gsid,
                v: data.gsid,
              };
            } else if (item.object === 'relationship_type') {
              result.TypeId = {
                fv: relLookupDisplayFieldName ? data[relLookupDisplayFieldName.toLowerCase()] || '---' : data.gsid,
                k: data.gsid,
                v: data.gsid,
              };
            }
          });

          return result;
        })
      ).toPromise();
  }

  getSearchQuery(lookupDisplayFieldName, value, object) {
    const { dataStoreType, connectionId, connectionType } = Cs360ContextUtils.getSourceDetailsForRelationship(this.translocoService);
    return {
      selectFields: uniq(['Gsid', lookupDisplayFieldName || 'Gsid']),
      searchFields: ['Gsid'],
      value: [value],
      operator: 'EQ',
      useDBName: false,
      object,
      source: connectionType,
      dataStore: dataStoreType,
      connectionId
    }
  }
}
