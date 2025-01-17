import { Injectable } from "@angular/core";
import { HybridHelper } from '@gs/gdk/utils/hybrid';
import { HttpProxyService } from '@gs/gdk/services/http';
import { of } from "rxjs";
import { map, publishReplay, refCount, tap } from "rxjs/operators";
import { API_ENDPOINTS } from "@gs/bm/constants";

export interface AssociationCondition {
    comparisonOperator: string;
    filterField:any;
    leftOperand: any;
    logicalOperator: string;
    rightOperandType:string;
    showLeftDropdown?: boolean;
    showRightDropdown?: boolean;
}

export interface MultipleAssociationConfigInfo {
  relationshipTypeIds?: string[];
  objectNames?: string[];
  objectConfigs?: AssociationConfigInfo[];
}

export interface AssociationConfigInfo {
  config?: {
    [key:string]: AssociationCondition[];
  };
  associationId?: string;
  objectName?: string;
  relationshipTypeIds?: string[];
  objectLabel?: string;
  advanceAssociationEnabled?: boolean;
  source?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AddAssociationContentService {

    cache = <any>{};

    constructor(private http: HttpProxyService) { 
    }

    getObjects() {
        if(this.cache.hasOwnProperty('OBJECT_NAMES') && this.cache.OBJECT_NAMES) {
            return of(this.cache.OBJECT_NAMES);
          }
          return this.http.get(API_ENDPOINTS.GET_OBJECTS)
            .pipe(
              map(sources => sources.data),
              publishReplay(1),
              refCount(),
              tap(data => this.cache.OBJECT_NAMES = data)
            );
        
    }

    getSFDCObjects() {
      if(!HybridHelper.isSFDCHybridHost()) {
        return of([]);
      }
      if(this.cache.hasOwnProperty('SFDC_OBJECT_NAMES') && this.cache.SFDC_OBJECT_NAMES) {
        return of(this.cache.SFDC_OBJECT_NAMES);
      }
      return this.http.get(API_ENDPOINTS.GET_SFDC_OBJECTS)
        .pipe(
          map(sources => sources.data),
          publishReplay(1),
          refCount(),
          tap(data => this.cache.SFDC_OBJECT_NAMES = data)
        );
    }

    getFilteredRelationshipTypes(objName: string) {
      return this.http.get(API_ENDPOINTS.GET_OBJECT_RELATIONSHIPTYPES(objName))
            .pipe(
              map(sources => sources.data),
              publishReplay(1),
              refCount()
            );
    }

    getRelationshipObjects() {
        if(this.cache.hasOwnProperty('RELATIONSHIP_OBJECTS') && this.cache.RELATIONSHIP_OBJECTS) {
            return of(this.cache.RELATIONSHIP_OBJECTS);
          }
          return this.http.get(API_ENDPOINTS.GET_RELATIONSHIP_OBJECTS)
            .pipe(
              map(sources => sources.data),
              publishReplay(1),
              refCount(),
              tap(data => this.cache.RELATIONSHIP_OBJECTS = data)
            );
        
    }

    saveAssociation(body: any) {
      return this.http.post(API_ENDPOINTS.UPSERT_ASSOCIATION, body);
    }

    saveMultipleAssociations(body: any) {
      return this.http.post(API_ENDPOINTS.UPSERT_MULTIPLE_ASSOCIATION, body);
    }
}
