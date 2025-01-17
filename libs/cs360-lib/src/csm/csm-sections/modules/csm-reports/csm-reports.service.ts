import {Inject, Injectable} from '@angular/core';
import {HttpProxyService} from "@gs/gdk/services/http";
import { EnvironmentService } from '@gs/gdk/services/environment';
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import { ReportFilterUtils } from "@gs/report/utils";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import { MappingResponse } from '@gs/cs360-lib/src/common';

@Injectable({
  providedIn: 'root'
})
export class CsmReportsService {

  constructor(private http: HttpProxyService,
              @Inject("envService") public env: EnvironmentService) { }

  getCompanyFilters(payload: any): Promise<any> {
    return this.http.post('v2/galaxy/transform/filter/company', payload)
        .pipe(
            map(config => config.data),
            catchError(_ => of(ReportFilterUtils.emptyFilters()))
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
  getPersonFilters(payload: any): Promise<any> {
      return this.http.post('v2/galaxy/transform/filter/person', payload)
          .pipe(
              map(config => config.data),
              catchError(_ => of(ReportFilterUtils.emptyFilters()))
          ).toPromise();
  }

  getGSMappings(): Observable<MappingResponse> {
    const GS = this.env.gsObject;
    const xGSHost = GS.hybridHostType ? `?x-gs-host=${GS.hybridHostType}` : '';
    if(typeof window["GSParent"] === "undefined") {
      return this.http.get(`/v1/galaxy/resolution/${GS.userConfig.crmConnections.SFDC[0]}${xGSHost}`)
          .pipe(
              map(data => data.data)
          )
    } else {
      return this.http.get(`/v1/galaxy/resolution/SFDC_${(<any>window).GSParent.appOrgId}${xGSHost}`)
          .pipe(
              map(data => data.data)
          )
    }
  }

  getAllChildAccounts(entityId: string, companyField: string): Observable<any> {
    return this.http.get(`v1/galaxy/hierarchy/company/${entityId}/ParentCompany?af=${companyField}`)
        .pipe(
            map(data => data.data)
        );
  }

  fetchAdditionalUrlCreationResources(objectName, accountRef) {

    // Need some additional values to generate the create record url
    // To get the values, we are making api call to '/api/describe'.
    // 1. objectId => 'keyPrefix' from describe api call.
    // 2. actualObjectId => 'objectId' in describe api call
    // 3. isStandardObject => 'objectType' === 'standard'
    // 4. recordTypeIds => find the field which have 'fieldName' === 'RecordTypeId' and get the options (from describe only)
    // 5. fieldId => fieldId of accountRef field

    const payload = {
        objectNames: [
          objectName
        ],
        host: 'SFDC',
        metadataVersion: 'V8_0',
        includeChilds: false,
        childLevels: 0,
        populatePickListOptions: true,
        useCollectionId: false,
        sortFieldsByLabel: false,
        populateFieldId:true,
        connectionType: 'SFDC',
        removeHidden: false,
        includeFields: false,
        removeDeleted: false,
        populateAutoSuggestDetails:true   
    };

    return this.http.post(`v1/api/describe`, payload).pipe(
      map(data => data.data && data.data[objectName]),
      map((data = {}) => {
          let accountLookupFieldName;
        const { objectId = '', fields = [], objectType = '', keyPrefix } = data;
        const isStandardObject = objectType.toLowerCase() === 'standard';
        const recordTypeIds = this.getRecordTypeIds(fields);
        const fieldId = this.getAccountRefFieldId(fields, accountRef);
        if(HybridHelper.isLightningEnabled()) {
            accountLookupFieldName = this.getAccountLookupFieldName(fields, accountRef);
        }

        const additionalUrlCreationResources = {
            objectId: keyPrefix,
            actualObjectId: objectId,
            isStandardObject,
            recordTypeIds,
            fieldId,
            accountLookupFieldName
        };

        return additionalUrlCreationResources;
      })
    );

  }

  getAccountLookupFieldName(fields, accountRef) {
      let accountLookupFieldName;
      if(accountRef) {
          accountLookupFieldName =  accountRef;
      } else {
          accountRef = this.getAccountRefField(fields);
          accountLookupFieldName = accountRef ? accountRef.fieldName : '';
      }
      return accountLookupFieldName;
  }


  getAccountRefField(fields) {
      return  fields.find((item) =>
          item.dataType.toLowerCase() === "lookup" &&
          item.meta &&
          item.meta.lookupDetail &&
          item.meta.lookupDetail.lookupObjects &&
          item.meta.lookupDetail.lookupObjects[0] &&
          item.meta.lookupDetail.lookupObjects[0].objectName.toUpperCase() === "ACCOUNT")
  }

  getRecordTypeIds(fields = []) {
    // recordTypeIds => find the field which have 'fieldName' === 'RecordTypeId' and get the options
    const recordTypeIdField = fields.find(({ fieldName = '' }) => fieldName.toLowerCase() === 'recordtypeid');
    const { options = [] } = recordTypeIdField || {};
    return options;
  }

  getAccountRefFieldId(fields, accountRef) {
      // fieldId of accountRef field
      let accountRefField;
      if (accountRef) {
          accountRefField = fields.find(({fieldName = ''}) => fieldName === accountRef);
      } else {
          accountRefField = this.getAccountRefField(fields);
      }
      return accountRefField && accountRefField.meta && accountRefField.meta.properties && accountRefField.meta.properties.fieldId || '';
  }

}
