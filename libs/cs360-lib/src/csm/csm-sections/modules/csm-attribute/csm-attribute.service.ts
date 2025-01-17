import { Inject, Injectable } from "@angular/core";
import {HttpProxyService} from "@gs/gdk/services/http";
import { API_ENDPOINTS, CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class CSMAttributeService { 

    private attrSaveErrorSubject = new Subject<any>();

    public attrSaveErrorObservable = this.attrSaveErrorSubject.asObservable();

    public treeData = {};

    constructor(private http: HttpProxyService, @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) { }

    getSectionData(entityDetail) {
        return this.http.post(API_ENDPOINTS.GET_SECTION_DATA(this.ctx.sectionPrependUrl), entityDetail)
    }

    setAttrSaveError() {
        this.attrSaveErrorSubject.next(true);
    }

    saveAttributeAndGetData(payload) {
        return this.http.put(API_ENDPOINTS.GET_SECTION_DATA(this.ctx.sectionPrependUrl), payload);
    }
    
    getDependentPicklistValues(entity: string, payload) {
        return this.http.post(API_ENDPOINTS.GET_DEPENDENT_PICKLIST_OPTIONS(entity), payload);
    }
}
