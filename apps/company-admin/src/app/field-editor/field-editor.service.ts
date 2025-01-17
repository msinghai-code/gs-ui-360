import { Injectable } from "@angular/core";
import {HttpProxyService} from "@gs/gdk/services/http";
import { APIUrls } from "../company-operations/constants";
import { DescribeService } from "@gs/gdk/services/describe";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class FieldEditorService {
    constructor(private _http: HttpProxyService, private descService: DescribeService) {}

    getDependencyItemMappings(requestInfo: {controllerId: string, dependentId:string}[]) {
      return this._http.post(APIUrls.GET_DEPENDENT_MAPPINGS, requestInfo);  
    }

    fetchCompanyAdvanceLookupForManagedBy(fieldValues): Observable<any> {
      const selectFields = ["Name", "Gsid"];
      const searchFields = ["Name", "ManagedAs"];
      const toReturn = new BehaviorSubject(null);
      let value: any = null;
      this.descService.getDescribedObject(
        { id: 'MDA', type: 'MDA', name: 'MDA' },
        'company'
      ).then(relationShipObject => {
        const { source, dbName, dataStore, fields: relationShipFields } = relationShipObject;
        for(let field of relationShipFields) {
          if(field.fieldName === "ManagedAs") {
            for(let option of field.options) {
              if(option.label === "Partner") {
                fieldValues[field.fieldName] = option.value;
                break;
              }
            }
            break;
          }
        }
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
            comparisonOperator: sf === 'ManagedAs' ? "EQ" : "CONTAINS",
            rightOperandType: "ManagedAs",
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
  
        this._http.post(APIUrls.ADVANCE_LOOKUPSEARCH, request).subscribe(res => {
          toReturn.next(['ManagedBy', res.data]);
        });
      })
      return toReturn.asObservable();
    }
}