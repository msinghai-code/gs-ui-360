import { Inject, Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {delay, map, publishReplay, refCount, tap} from "rxjs/operators";
import {HttpProxyService} from "@gs/gdk/services/http";
import { pick } from "lodash";

import {API_URLS} from "./layout-configuration.constants";
import { ADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { LayoutDetails } from './layout-upsert/layout-upsert.interface';
// import { LayoutSharingType } from './layout-upsert/layout-upsert.constants';
import { EnvironmentService } from '@gs/gdk/services/environment';


@Injectable({
  providedIn: 'root'
})
export class LayoutConfigurationService {

  public cache: any = {};
  private obejectName: string;

  constructor(private http: HttpProxyService, @Inject(ADMIN_CONTEXT_INFO) public ctx,
    @Inject("envService") private env: EnvironmentService) { 
      // this.obejectName = Cs360ContextUtils.getBaseObjectName(this.ctx);
      this.obejectName = this.ctx.baseObject;
    }

  fetchStandardLayouts(isPartner?: boolean): Observable<any[]> {
    if(this.cache.hasOwnProperty('LAYOUTS') && this.cache.LAYOUTS) {
      return of(this.cache.LAYOUTS);
    }
    let url = API_URLS.LAYOUT_LISTING.GET_ALL_LAYOUTS(this.ctx.sharingType, this.obejectName);
    if(isPartner) {
      url = url + "?managedAs=partner"
    }
    return this.http.get(url)
      .pipe(
        map(sources => sources.data),
        publishReplay(1),
        refCount(),
        tap(data => this.updateCache('LAYOUTS', data))
      );
  }

  fetchCommonSections() {
    if(this.cache.hasOwnProperty('COMMON_SECTIONS') && this.cache.COMMON_SECTIONS) {
      return of(this.cache.COMMON_SECTIONS);
    }
    return this.http.get(API_URLS.COMMON_SECTIONS.GET_COMMON_SECTIONS(this.obejectName))
      .pipe(
        map(sections => sections.data),
        publishReplay(1),
        refCount(),
        tap(data => this.updateCache('COMMON_SECTIONS', data))
      );
  }

  fetchAssociations() {
    if(this.cache.hasOwnProperty('OBJECT_ASSOCIATIONS') && this.cache.COMMON_SECTIONS) {
      return of(this.cache.OBJECT_ASSOCIATIONS);
    }
    return this.http.get(API_URLS.OBJECT_ASSOCIATIONS.GET_OBJECT_ASSOCIATIONS)
      .pipe(
        map(response => response.data),
        publishReplay(1),
        refCount(),
        tap(data => this.updateCache('OBJECT_ASSOCIATIONS', data))
      );
  }

  renameLayout(details: LayoutDetails){
    const requestBody = pick(details, ['name', 'description', 'layoutId', 'relationshipTypeId', 'entityType']);
    // requestBody.sharingType = LayoutSharingType.INTERNAL;
    requestBody.sharingType = this.ctx.sharingType;
    let url = API_URLS.LAYOUT_LISTING.RENAME_LAYOUT(details.layoutId);
    if(details.managedAs === "partner") {
      url = url + "?managedAs=partner";
    }
    return this.http.put(url, requestBody);
  }

  deleteAssociation(assocId: string) {
    return this.http.delete(API_URLS.OBJECT_ASSOCIATIONS.DELETE_ASSOCIATION(assocId));
  }

  cloneLayout(payload): Observable<any> {
    return this.http.post(API_URLS.LAYOUT_LISTING.CLONE_LAYOUT(), payload);
  }

  deleteLayout(layoutId: string, relationshipTypeId = ''): any {
    relationshipTypeId = relationshipTypeId ? '/' + relationshipTypeId: '';
    return this.http.delete(API_URLS.LAYOUT_LISTING.DELETE_LAYOUT(this.ctx.sharingType, this.obejectName + relationshipTypeId, layoutId));
  }

  markAsDefault(layoutId: string, relationshipTypeId = '', isPartner?: boolean): any {
    relationshipTypeId = relationshipTypeId ? '/' + relationshipTypeId: '';
    let url = API_URLS.LAYOUT_LISTING.MARK_AS_DEFUALT(this.ctx.sharingType, this.obejectName + relationshipTypeId, layoutId);
    if(isPartner) {
      url = url + "?managedAs=partner";
    }
    return this.http.put(url, {});
  }

  deleteSection(sectionId: string): any {
    return this.http.delete(API_URLS.LAYOUT_LISTING.DELETE_SECTION(sectionId));
  }

  reorderLayouts(payload: any): Observable<any[]> {
    return this.http.post(API_URLS.LAYOUT_LISTING.SAVE_LAYOUT_ORDER, payload);
  }

  public updateCache(key: string, data: any) {
    if(!this.cache.hasOwnProperty(key) && !this.cache[key]) {
      this.cache[key] = data;
    }
  }

  public getCacheByKey(key: string): any[] {
    if(this.cache.hasOwnProperty(key) && this.cache[key]) {
      return this.cache[key];
    }
    return [];
  }

  public setCache(data) {
    this.cache = data;
  }

  public getCache() {
    return this.cache;
  }

  public invalidateCache() {
    // This will invalidate the cache.
    this.setCache({});
  }

  getBootstrapData() {
    return this.env.moduleConfig;
  }

  updateP360PreviewFeatureFlag(pageContext:string, isEnable: boolean) {
    // @ts-ignore
    return this.http.patch(`${API_URLS.FEATURE_FLAGS[pageContext]}?isEnable=${isEnable}`).pipe(
        map(data => {
          return data;
        })
    );
  }

  getMini360adminEnabled(){
    return this.http.get(API_URLS.LAYOUT_LISTING.GET_MINI360_ENABLED)
    .pipe(map((response: any) => {
      return !!response && !!response.data ? response.data: {};
    }));
  }
  
  updateMini360adminEnabled(payload){
    return this.http.put(API_URLS.LAYOUT_LISTING.UPDATE_MINI360_ENABLED, payload);
  }
}
