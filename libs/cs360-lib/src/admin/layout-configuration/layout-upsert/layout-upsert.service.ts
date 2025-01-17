import { Inject, Injectable } from '@angular/core';
import {HttpProxyService} from "@gs/gdk/services/http";
import { Observable, of, Subject } from 'rxjs';
import { map, publishReplay, refCount, tap } from 'rxjs/operators';
import { API_URLS } from '../layout-configuration.constants';
import { LayoutAssignmentDetails, LayoutDetails, LayoutSection } from './layout-upsert.interface';
import { findIndex, pick, cloneDeep } from 'lodash';
// import { LayoutSharingType } from './layout-upsert.constants';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { PageContext, ObjectNames, APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import { Router } from '@angular/router';

enum LayoutUpsertCacheEnum {
  COMMON_SECTIONS = "commonSections",
  LAYOUTS_INFO = "layoutsInfo",
  LAYOUTS_ASSIGN_INFO = "layoutsAssignInfo",
  OBJECT_ASSOCIATIONS = "objectAssociations"
}

@Injectable({
  providedIn: 'root'
})
export class LayoutUpsertService {

  private layoutUpsertCache = {};
  private objectName: string;
  private setLayoutUpsertStep = new Subject<boolean>();
  
  public setLayoutStepObservable = this.setLayoutUpsertStep.asObservable();

  constructor(private http: HttpProxyService, 
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
    private router: Router
    ) { 
    this.objectName = this.ctx.baseObject;
  }

  resetLayoutUpsertStep(val?) {
    this.setLayoutUpsertStep.next(val);
  }

  fetchAssociations() {
    if (this.layoutUpsertCache.hasOwnProperty(LayoutUpsertCacheEnum.OBJECT_ASSOCIATIONS) && this.layoutUpsertCache[LayoutUpsertCacheEnum.OBJECT_ASSOCIATIONS]) {
      return of(cloneDeep(this.layoutUpsertCache[LayoutUpsertCacheEnum.OBJECT_ASSOCIATIONS]));
    }
    return this.http.get(API_URLS.OBJECT_ASSOCIATIONS.GET_OBJECT_ASSOCIATIONS)
      .pipe(
        map(response => response.data),
        publishReplay(1),
        refCount(),
        tap(data => this.updateCache(LayoutUpsertCacheEnum.OBJECT_ASSOCIATIONS, data))
    );
  }

  getCommonSections(isPartner?: boolean): Observable<LayoutSection[]> {
    if (this.layoutUpsertCache.hasOwnProperty(LayoutUpsertCacheEnum.COMMON_SECTIONS) && this.layoutUpsertCache[LayoutUpsertCacheEnum.COMMON_SECTIONS]) {
      return of(cloneDeep(this.layoutUpsertCache[LayoutUpsertCacheEnum.COMMON_SECTIONS]));
    }
    let url = API_URLS.COMMON_SECTIONS.GET_COMMON_SECTIONS(this.objectName);
    url = isPartner ? url + "?managedAs=partner" : url;
    return this.http.get(url)
    .pipe(
        map(sections => sections.data),
        publishReplay(1),
        refCount(),
        tap(data => {
          this.updateCache(LayoutUpsertCacheEnum.COMMON_SECTIONS, cloneDeep(data));
        })
      );
  }

  getLayoutSections(layoutId, isPartner?: boolean): Observable<LayoutDetails> {
    const index = findIndex(this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO], layout => layout.layoutId === layoutId);
    if (index !== -1) {
      return of(this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO][index]);
    }
    let url = API_URLS.LAYOUT_SECTIONS.GET_LAYOUT_SECTIONS(layoutId);
    url = isPartner ? url + "?managedAs=partner" : url;
    return this.http.get(url)
      .pipe(
        publishReplay(1),
        refCount(),
        tap((response) => {
          const { result, data } = response;
          if(result) {
            const index = findIndex(this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO], layout => layout.layoutId === layoutId);
            if (index !== -1) {
              this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO][index] = data;
            } else {
              this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO] = [data];
            }
          } else {
            this.router.navigateByUrl(APPLICATION_ROUTES.LAYOUT_NOT_FOUND)
          }
        }),
        map(res => res.data)
      );
  }

  getLayoutAssignment(layoutId: string) {
    return this.http.get(API_URLS.LAYOUT_ASSIGN.GET_LAYOUT_ASSIGNMENT(layoutId))
      .pipe(
        map(response => response.data)
      );
  }

  setLayoutAssignment(assignmentDetails: LayoutAssignmentDetails) {
    // if(this.objectName === ObjectNames.RELATIONSHIP) {
    //   assignmentDetails.relationshipTypeId = this.ctx.relationshipTypeId;
    // }
    if(this.ctx.contextTypeId) {
      assignmentDetails[this.ctx.contextTypeId] = this.ctx[this.ctx.contextTypeId];
    }
    // assignmentDetails.sharingType = LayoutSharingType.INTERNAL;
    assignmentDetails.sharingType = this.ctx.sharingType;
    assignmentDetails.entityType= this.objectName;
    return this.http.post(API_URLS.LAYOUT_ASSIGN.UPDATE_LAYOUT_ASSIGNMENT, assignmentDetails)
      .pipe(
        map(response => response.data)
      );
  }

  upsertLayout(details: LayoutDetails): Observable<any> {
    if (!details.layoutId) {
      delete details.status;
      return this.addLayout(details);
    } else {
      const updateDetails = {
        name: details.name,
        layoutId: details.layoutId,
        description: details.description,
        sections: details.sections
      };
      return this.updateLayout(updateDetails);
    }
  }

  updateLayout(details: LayoutDetails) {
    const requestBody = pick(details, ['name', 'layoutId', 'description', 'sections', 'status', 'managedAs']);
    requestBody.entityType = this.objectName;
    if(this.ctx.contextTypeId) {
      requestBody[this.ctx.contextTypeId] = details[this.ctx.contextTypeId];
    }
    return this.http.put(API_URLS.LAYOUT_LISTING.UPDATE_LAYOUT(details.layoutId), requestBody)
      .pipe(
        publishReplay(1),
        refCount(),
        tap(data => {
          const index = findIndex(this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO], layout => layout.layoutId === details.layoutId);
          if(index !== -1) {
            this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO][index] = data;
          }
        })
      );
  }

  detachSection(layoutId: string, sectionId: string) {
    return this.http.get(API_URLS.LAYOUT_SECTIONS.DETACH_SECTION(layoutId, sectionId))
    .pipe(
      map(response => response.data),
      publishReplay(1),
      refCount(),
      tap(data => {
        const index = findIndex(this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO], layout => layout.layoutId === layoutId);
        if(index !== -1) {
          this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO][index] = data;
        }
      })
    );
  }

  addLayout(details: LayoutDetails) {
    return this.http.post(API_URLS.LAYOUT_LISTING.ADD_LAYOUT, details)
      .pipe(
        publishReplay(1),
        refCount(),
        tap(response => {
          if (this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO] !== undefined){
            this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO] = this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO].filter((ele) => {return ele != null})
          }
          else {
            this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO]  = this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO] 
          }
          if (this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO] && this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO].length) {
            this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO].push(response.data)
          } else {
            this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO] = [response.data];
          }
        }
        )
      );
  }

  saveLayoutSection(section: LayoutSection, layoutId: string) {
    return this.http.post(API_URLS.LAYOUT_SECTIONS.ADD_LAYOUT_SECTION(layoutId), section)
      .pipe(
        map(response => response.data),
        publishReplay(1),
        refCount(),
        tap(data => {
          const index = findIndex(this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO], layout => layout.layoutId === layoutId);
          this.layoutUpsertCache[LayoutUpsertCacheEnum.LAYOUTS_INFO][index] = data;
        })
      );
  }

  private updateCache(property: string, data: any) {
    this.layoutUpsertCache[property] = data;
  }

  destroyCache() {
    this.layoutUpsertCache = {};
  }

}

@Injectable()
export class SharedRouteOutletService {
  // Observable string sources
  private emitChangeSource = new Subject<any>();
  // Observable string streams
  changeEmitted$ = this.emitChangeSource.asObservable();
  // Service message commands
  emitChange(change: any) {
    this.emitChangeSource.next(change);
  }
}
