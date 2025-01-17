import { Inject, Injectable } from '@angular/core';
import {HttpProxyService} from "@gs/gdk/services/http";
import { CSM_API_URLS, CompanyHierarchyState } from '@gs/cs360-lib/src/common';
import { Subject } from 'rxjs';
import { EnvironmentService } from "@gs/gdk/services/environment";

@Injectable({
  providedIn: 'root'
})
export class CsmCompanyHierarchyService {

  dataFetchSubject = new Subject<CompanyHierarchyState>();

  private state: CompanyHierarchyState;

  constructor(private http: HttpProxyService, @Inject("envService") private env: EnvironmentService) {
  }

  getCompanyHierarchyState() {
    return this.state;
  }

  setCompanyHierarchyState(state: CompanyHierarchyState) {
    this.state = state;
    this.dataFetchSubject.next(state);
  }

  fetchData(state:CompanyHierarchyState, view: string) {
    const cid = this.env.moduleConfig.layoutData.layoutResolverDTO.companyId;
    const layoutId = this.env.moduleConfig.layoutData.layout.layoutId;
    const request = {
      "entityId" : cid,
      "layoutId" : layoutId,
      "sectionId" : state.sectionId,
      "config": {
          "view": view.toUpperCase(),
          "selfLookup": {
              "fieldName": "ParentCompany",
              "objectName": "company",
              "label": "ParentCompany",
              "hasLookup": "",
              "dataType": "STRING",
              "fieldPath": null
          },
          "whereClause": state.whereClause
        },
    }
    return this.http.post(CSM_API_URLS.FETCH_DATA(cid), request);
  }

  getSelfLookupField() {
    return {
      fieldName: "ParentCompany",
      objectName: "company",
      label: "ParentCompany",
      hasLookup: "",
      dataType: "STRING",
      fieldPath: null
    }
  }

  isValidHTMLTagFromString(value: string, tags: any) {
    const doc = new DOMParser().parseFromString(value, 'text/html');
    return doc.body.querySelectorAll(tags);
  }

  toConvertHTML(inputString){
    const string = inputString;

    // Create a temporary container element
    const tempContainer = document.createElement('div');

    // Set the innerHTML of the container to the string
    tempContainer.innerHTML = string;

    // Get the first child element (the converted HTML)
    const htmlElement = tempContainer.firstChild;
    return htmlElement;
  }
}
