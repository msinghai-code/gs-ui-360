import { Inject, Injectable } from '@angular/core';
import {HybridHelper} from "@gs/gdk/utils/hybrid";
import {HttpProxyService} from "@gs/gdk/services/http";
import { API_ENDPOINTS, PageContext } from './../cs360.constants';
import { PinnedSection } from '../../common/pojo/pinned-section';
import { CS360CacheService } from './cs360-cache.service';
import { map, publishReplay, refCount, tap, switchMap, delay } from "rxjs/operators";
import { CONTEXT_INFO, ICONTEXT_INFO } from '../context.token';
import { BehaviorSubject, forkJoin, Subject, Observable, of } from "rxjs";
import { Title } from "@angular/platform-browser";
import {formMiniSectionsConfig, isMini360, resolveSFWidgetProperties} from './../cs360.utils';
import { find, orderBy, isEmpty, map as arrayMap } from 'lodash';
import { ObjectNames } from './../cs360.constants';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NzNotificationService} from "@gs/ng-horizon/notification";
import { IADMIN_CONTEXT_INFO } from '../admin.context.token';
import {PxService} from "./px.service";

const REQUIRED_SECTION_META: { sectionType: string; endPointFn: any; }[] = [{
  sectionType: 'COMPANY_INTELLIGENCE',
  endPointFn: (companyId) => API_ENDPOINTS.GET_SALLY_BOOTSTRAP(companyId)
}];

interface R360C360SwitchInfo {
  id: string;
  pageContext: PageContext
}
interface CACHE {
  RESOLVE_LAYOUT: {
    C360: {
      // companyId : response
      [key: string]: any;
    };
    R360: {
      // relationshipId : response
      [key: string]: any;
    };
  },
  FEATURE_TOGGLE: {
    C360: any;
    R360: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class CS360Service {
  constructor(
    private http: HttpProxyService,
    @Inject("envService") private _env: EnvironmentService,
    private cs360CacheService: CS360CacheService,
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
    private titleService : Title,
    private notification: NzNotificationService,
    public pxService: PxService
    ) { }


  private switchR360C360Subject = new Subject<R360C360SwitchInfo>();

  private googleSlidesEnabled: boolean = false;
  private userDetails: any= {};
  private cache: CACHE = {
    RESOLVE_LAYOUT: {
      C360: {
  
      },
      R360: {
  
      }
    },
    FEATURE_TOGGLE: {
      C360: null,
      R360: null
    }
  };

  private isCreateCtaGranularActionAllowed = true;
  // a map of sectionId vs sectionMeta
  public sectionMetaMap = {};
  public isSuperAdmin = false;

  set360ToRender(info: R360C360SwitchInfo) {
    this.switchR360C360Subject.next(info);
  }

  getSwitch360SubjectAsObservable(): Observable<any>{ 
    return this.switchR360C360Subject.asObservable();
  }

  public getBootstrap(entity: string) {
    if(this.ctx.cache && this.ctx.cache.FEATURE_TOGGLE && this.cache.FEATURE_TOGGLE[entity]) {
      return of(this.cache.FEATURE_TOGGLE[entity]).pipe(
        delay(1000)
      );
    }
    return this.http.get(API_ENDPOINTS.GET_CONSUMPTION_BOOTSTRAP(entity))
    .pipe(
      tap(res => {
        if(this.ctx.cache && this.ctx.cache.FEATURE_TOGGLE) {
          this.cache.FEATURE_TOGGLE[entity] = res;
        }
      })
    );
  }

  public resolveLayout(payload, resolveType) {
    if(this.cache && !isEmpty(this.cache.RESOLVE_LAYOUT[this.ctx.pageContext]) && this.ctx.cache && this.ctx.cache.RESOLVE_LAYOUT) {
      // if(this.ctx.pageContext === 'C360' && this.cache.RESOLVE_LAYOUT.C360[payload.companyId]) {
      //   return of(this.cache.RESOLVE_LAYOUT.C360[payload.companyId]);
      // } else if (this.ctx.pageContext === 'R360' && this.cache.RESOLVE_LAYOUT.R360[payload.relationshipId]) {
      //   return of(this.cache.RESOLVE_LAYOUT.R360[payload.relationshipId]);
      // }
      return of(this.cache.RESOLVE_LAYOUT[this.ctx.pageContext][payload[this.ctx.uniqueIdentifierFieldName]]);
    }
    return this.http.post(API_ENDPOINTS.RESOLVE_LAYOUT(resolveType, this.ctx.layoutResolvePrependUrl) + (isMini360(this.ctx) ? "?isMini360=true" : ""), payload)
      .pipe(
        tap( res => {
          if(this.ctx.cache && this.ctx.cache.RESOLVE_LAYOUT) {
            // if(this.ctx.pageContext === 'C360') {
            //   this.cache.RESOLVE_LAYOUT.C360[payload.companyId] = res;
            // } else if (this.ctx.pageContext === 'R360') {
            //   this.cache.RESOLVE_LAYOUT.R360[payload.relationshipId] = res;
            // }
            this.cache.RESOLVE_LAYOUT[this.ctx.pageContext][payload[this.ctx.uniqueIdentifierFieldName]] = res;
          }
        })
      );
  }

  public getSectionRequiredMeta(section, layoutDetails: any) {
    switch (section.sectionType) {
      case "COMPANY_INTELLIGENCE": return new Observable(observer => {
        const sectionMeta = this.sectionMetaMap[section.sectionId];
        if(sectionMeta) {
          observer.next(sectionMeta);
          observer.complete();
        } else {
          this.getCompanyIntelligenceMeta(layoutDetails).subscribe(res => {
            observer.next(res);
            observer.complete();
          })
        }
      });
    }
  }

  private getCompanyIntelligenceMeta(layoutDetails: any) {
    return this.http.get(API_ENDPOINTS.GET_SALLY_BOOTSTRAP(layoutDetails.companyId));
  }

  public getExternalSharingLayouts(areaName: string) {
    return this.http.get(API_ENDPOINTS.GET_EXT_LAYOUTS(areaName));
  }

  public upsertPinnedItems(payload: PinnedSection) {
    const moduleConfig = this.cs360CacheService.getModuleConfig();
    let layoutId = undefined;
    if (moduleConfig.layoutData && moduleConfig.layoutData.layout) {
      layoutId = moduleConfig.layoutData.layout.layoutId;
    }
    return this.http.post(API_ENDPOINTS.SAVE_PINNED_ITEMS + (isMini360(this.ctx) ? "?isMini360=true" : ""), { ...payload, layoutId }).pipe(map(response => {
      return { ...response.data } as PinnedSection;
    }));
  }

  public resetPinnedItems() {
    const moduleConfig = this.cs360CacheService.getModuleConfig();
    let layoutId = undefined;
    if (moduleConfig.layoutData && moduleConfig.layoutData.layout) {
      layoutId = moduleConfig.layoutData.layout.layoutId;
    }
    return this.http.post(API_ENDPOINTS.RESET_PINNED_ITEMS + (isMini360(this.ctx) ? "?isMini360=true" : ""), { layoutId }).pipe(map(response => {
      return { ...response.data } as any;
    }));
  }

  // Go to spaces button
  public fetchSpaceAdminEnablementWhenIdle(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Fetch data from API when idle
      this.startIdleTask((deadline) => {
        console.log("Performing task when idle...");
        this.checkForSpaceAdminEnablement().subscribe((response: any) => {
          if(response.result) {
            const status: boolean = response.data.allowed;
            resolve(status);
          } else {
            resolve(false);
          }
        });
      });
    });
  }

  startIdleTask(callback: (deadline: any) => void) {
    if ('requestIdleCallback' in window) {
      (<any>window).requestIdleCallback(callback);
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      console.warn("requestIdleCallback is not supported. Fallback to setTimeout.");
      setTimeout(callback, 0);
    }
  }

  saveAttribute(payload, entityId) {
    return this.http.put(API_ENDPOINTS.SAVE_ATTRIBUTE('company', entityId), payload);
  }

  // For cosumption we have multi Attribute saving wrapper api so we pass through ctx and update it here on basis of api availability
  saveAttributeAndGetData(payload) {
    // this is person Api payload.data
    return  this.ctx.saveMultiAttributeurl ?
      this.http.post(this.ctx.saveMultiAttributeurl, payload)
      : this.http.put(API_ENDPOINTS.GET_SECTION_DATA(this.ctx.sectionPrependUrl), payload);
  }

  getSectionData(payload,context?:ICONTEXT_INFO | IADMIN_CONTEXT_INFO) {
    return this.http.post(API_ENDPOINTS.GET_SECTION_DATA(
        context ? context.sectionPrependUrl : this.ctx.sectionPrependUrl,
        context ? context.attributeUrl : this.ctx.attributeUrl
      ), payload).pipe(
      map(response => { return response.data && response.data[0] }),
      publishReplay(1),
      refCount()
    );
  }

  previewSaveSection(companyId: string, payload: any) {
    return this.http.post(API_ENDPOINTS.PREVIEW_SECTION(companyId), payload).pipe(
      map(response => { return response.data && response.data[0] }),
      publishReplay(1),
      refCount()
    );
  }

  isReadOnly() {
    return this._env.gsObject.isReadOnlyApp || false;
  }

  public getAllowedImageFormats() {
    return of([".jpeg", ".jpg", ".png"])
  }

  public getSuccessSnapshots() {
    return this.http.get(API_ENDPOINTS.GET_SUCCESS_SNAPSHOTS);
  }

  public getSuccessPlans(entity?: string, id?: string) {
    if (entity.toUpperCase() === 'ACCOUNT') {
      return this.http.get(`${API_ENDPOINTS.GET_SUCCESS_PLANS}?entity=${entity.toLowerCase()}&accountId=${id}`);
    } else {
      return this.http.get(`${API_ENDPOINTS.GET_SUCCESS_PLANS}?entity=${entity.toLowerCase()}&relationshipId=${id}`);
    }
  }

  public checkAuthentication() {
    return this.http.get(`${API_ENDPOINTS.CHECK_AUTH}`);
  }

  public getGsUsersData(payload) {
    return this.http.post(`${API_ENDPOINTS.GET_GS_USERS}`, payload);
  }

  getUserDetails() {
    return this.http.get(`${API_ENDPOINTS.GET_USER}`).pipe(map((response: any) => {
      if (response.success) {
        this.userDetails = response.data;
        return response.data;
      } else {
        return false;
      }
    }));
  }

  public fetchGooglePpts() {
    // return this.http
  }

  public shareSS(payload: any, ssId?: string, storageType?: any) {
    if (storageType === 'S3') {
      return this.http.post(`${API_ENDPOINTS.EXPORT_SS_REVAMP}/${ssId}`,payload);
    } else {
      return this.http.post(`${API_ENDPOINTS.EXPORT_SS}/${ssId}`,payload);
    }
  }

  public checkForGoogleSlides() {
    return this.http.get(`${API_ENDPOINTS.GOOGLE_SLIDES_FEATURE_TOGGLE}`).pipe(map( (response: any) => {
      if (response.success) {
        this.googleSlidesEnabled = response.data.value;
        return response.data.value;
      } else {
        return false;
      }
    }));
  }

  public checkForSPAccess() {
    return this.http.get(`${API_ENDPOINTS.PRICING_SUCCESSPLAN_FEATURE_TOGGLE}`);
  }

  public checkForRelationShipAccess() {
    return this.http.get(`${API_ENDPOINTS.PRICING_RELATIONSHIP_FEATURE_TOGGLE}`)
  }

  public checkForSsHaEnablement() {
    return this.http.get(`${API_ENDPOINTS.SS_FEATURE_TOGGLE}`)
  }

  public checkForSpaceAdminEnablement() {
    return this.http.get(`${API_ENDPOINTS.SPACE_ENABLEMENT_CHECK}`);
  }

  public checkForSPAndRelationshipAccess(payload: any, ssId?: string) {
    return this.http.post(`${API_ENDPOINTS.CHECK_FOR_SP_AND_RS_REPORTS}/${ssId}`, payload);
  }

  revokeAccess() {
    return this.http.get(`${API_ENDPOINTS.REVOKE_ACCESS}`);
  }

  get userDetailsData() {
    return this.userDetails;
  }

  set setUserDetails(data) {
    this.userDetails = data;
  }

  queries(objectName, payload) {
    return this.http.post(`v2/queries/${objectName}`, payload);
  }

  updateContextData(context = {}, externalFields = []): Observable<boolean> {
    const { moduleConfig = {} } = this._env;
    const GS = this._env.gsObject;
    return new Observable(observer => {
      forkJoin([this.getConfig(context, externalFields)]).subscribe(([config]: any[]) => {
        if (config && config.layoutData) {
          this.ctx.companyName = config.layoutData.data.company_Name || config.layoutData.data["relationship_CompanyId__gr.Name"];
          this.ctx[`${this.ctx.baseObject}Name`] = config.layoutData.data[`${this.ctx.baseObject}_Name`] || config.layoutData.data[`${this.ctx.baseObject}__Name`] || '';
          this.ctx.relationshipTypeId = config.layoutData.layoutResolverDTO.relationshipTypeId;
          this.ctx.aId = config.layoutData.layoutResolverDTO.accountId;
          this.ctx.customProperties = {...this.ctx.customProperties,layoutData:config.layoutData.data};
          if(!isMini360(this.ctx)) {
            let title = this.ctx[`${this.ctx.baseObject}Name`];
            if(!this.ctx.error) {
              title = `${title} | ${this.ctx.pageContext}`;
            }
            this.titleService.setTitle(title);
            HybridHelper.setPageTitle(title);
          }
          if(!this.ctx.cId) {
            this.ctx.cId = config.layoutData.layoutResolverDTO.companyId || null;
          }
          if(!this.ctx.entityId) {
            this.ctx.entityId = config.layoutData.layoutResolverDTO.entityType.toLowerCase() === ObjectNames.COMPANY ? this.ctx.cId : this.ctx.rId;
          }
          this._env.moduleConfig = { ...moduleConfig, ...config};
          // Update companyId and accountId if not present.
          if(!GS.companyId || isMini360(this.ctx)) {
            GS.companyId = config.layoutData && config.layoutData.layoutResolverDTO ? config.layoutData.layoutResolverDTO.companyId: null;
          }
         
            GS.accountId = config.layoutData && config.layoutData.layoutResolverDTO ? config.layoutData.layoutResolverDTO.accountId: null;
        } else {
          /* resetting on failure to avoid stale data for subsequent companies being opened in case of mini*/
          GS.companyId = "";
          GS.accountId = "";
          this._env.moduleConfig = {};
        }
        observer.next(true);
        observer.complete();
      });
    });
  }

  getConfig(context?, externalFields?) {
    const { resolveType, payload } = this.getResolvePayload(externalFields);
    return forkJoin([
      this.getBootstrap(this.ctx.pageContext),
      this.resolveLayout(payload, resolveType)
    ]).pipe(switchMap(([bootstrapResponse, layoutResponse]) => {
      const widgetConfig = resolveSFWidgetProperties();
      const { isNativeWidget, height, sectionType, sectionLabel, showTimeline } = widgetConfig;
      let config = { isNativeWidget, height, sectionType, sectionLabel } as any;
      if (bootstrapResponse.result) {
        const { data: bootstrapConfig } = bootstrapResponse;
        config = { ...config, bootstrapConfig };
      }

      if (layoutResponse.result) {
        const { data } = layoutResponse;
        let { layout: { sections, layoutId } } = data;
        if(isMini360(context)) {
          sections = formMiniSectionsConfig(sections);
        }
        let updatedSections = sections;
        if (isNativeWidget && (sectionType || sectionLabel)) {
          const sType = sectionType && sectionType.toUpperCase();
          const sLabel = sectionLabel && sectionLabel.toUpperCase();
          const section = find(sections || [], (si) => si.label.toUpperCase() === sLabel || si.sectionType.toUpperCase() === sType);
          updatedSections = [{ ...section, layoutId }];
          this.ctx.isSmartWidget = true;
          if(showTimeline) {
            const section = find(sections || [], si=> si.sectionType.toUpperCase() === "TIMELINE");
            if(section) {
              updatedSections.push({...section, layoutId});
            }
          }
        }
        updatedSections = arrayMap(updatedSections, (section) => {
          // will have to include feature toggle based filtering here in future
          const requiredSectionMeta = REQUIRED_SECTION_META.find(metaSection => metaSection.sectionType === section.sectionType);
          if (requiredSectionMeta) {
            this.http.get(requiredSectionMeta.endPointFn(data.layoutResolverDTO.companyId)).subscribe(res => {
              if(!res.data) {
                return;
              }
              
              let unread = res.data.unread;
              unread = !isNaN(unread) && parseInt(unread);
              this.sectionMetaMap[section.sectionId] = {
                ...res.data,
                unread
              };
            });
            return { ...section, layoutId, sectionMeta: this.getSectionRequiredMeta(section, data.layoutResolverDTO) };
          } else {
            return { ...section, layoutId, sectionMeta : new BehaviorSubject(null)};
          }
        });

        const layoutData = {
          ...layoutResponse.data,
          layout: {
            ...layoutResponse.data.layout,
            sections: updatedSections
          }
        };
        /* to handle -1 being sent as displayOrder for mini 360 unsupported sections */
        const supportedSections = updatedSections.filter(section => section.displayOrder >= 0);
        const unsupportedSections = updatedSections.filter(section => section.displayOrder < 0);
        config = { ...config, sections: [...orderBy(supportedSections, ['displayOrder'], ['asc']), ...unsupportedSections], layoutData };
      } else if(layoutResponse.error) {
        this.ctx.error = layoutResponse.error.message;
        // this.ctx.errorType = this.ctx.pageContext === PageContext.C360 ? 'COMPANY_NOT_FOUND' : 'RELATIONSHIP_NOT_FOUND';
        config = { ...config, sections: [], layoutData : null };
      }
      return of(config);
    }));
  }

  getResolvePayload(externalFields = []) {
    const searchParams = new URLSearchParams(window.location.search);
    let aidInQueryParam = false;
    let externalIdInQueryParam = null;
    searchParams.forEach((value, key) => {
      if(key.toLowerCase() === 'aid') {
        aidInQueryParam = true;
      }
      const paramAsExternalField = externalFields.find(eF => eF.toUpperCase() === key.toUpperCase());
      if(paramAsExternalField) {
        externalIdInQueryParam = {key: paramAsExternalField, value};
      }
    });

    if(this.ctx.aId && (isMini360(this.ctx) || aidInQueryParam)) {
      let payload: any = {
        accountId : this.ctx.aId,
        entityType: "company",
        sharingType: this.ctx.sharingType,
        consumptionArea: this.ctx.consumptionArea
      };
      if(HybridHelper.isSFDCHybridHost() && this._env.gsObject.userConfig.crmConnections && this._env.gsObject.userConfig.crmConnections.SFDC && this._env.gsObject.userConfig.crmConnections.SFDC[0]) {
        payload.connectionId = this._env.gsObject.userConfig.crmConnections.SFDC[0];
      }
      if(this.ctx.isp) {
        try {
          payload = {...payload, layoutId: sessionStorage.getItem('layoutId')}
        } catch (e) {
          throw new Error('Sessionstorage is not supported.');
        }
      }
      return { payload, resolveType : 'aid'};
    } else if(this.ctx.dId) {
      let payload: any = {
        dynamicsId : this.ctx.dId,
        connectionId: "DYNAMICS_" + this._env.gsObject.query_params.dynamic_tid,
        entityType: "company",
        sharingType: this.ctx.sharingType
      };
      return { payload, resolveType : 'did'};
    } else if (externalIdInQueryParam) {
      let payload = {
        entityType: this.ctx.entityType,
        sharingType: "internal",
        externalId: externalIdInQueryParam.value,
        externalIdField: externalIdInQueryParam.key
      };
      return {payload, resolveType: 'cid'};
    } else {
      let payload: any = {
        [this.ctx.baseObject + "Id"]: this.ctx[this.ctx.uniqueCtxId],
        entityId: this.ctx[this.ctx.uniqueCtxId],
        entityType: this.ctx.entityType,
        sharingType: this.ctx.sharingType,
        consumptionArea: this.ctx.consumptionArea
      };
      if(HybridHelper.isSFDCHybridHost() && this._env.gsObject.userConfig.crmConnections && this._env.gsObject.userConfig.crmConnections.SFDC && this._env.gsObject.userConfig.crmConnections.SFDC[0]) {
        payload.connectionId = this._env.gsObject.userConfig.crmConnections.SFDC[0];
      }
      const resolveType = this.ctx.layoutResolveType;
      if(this.ctx.isp) {
        try {
          payload = {...payload, layoutId: sessionStorage.getItem('layoutId')}
        } catch (e) {
          throw new Error('Sessionstorage is not supported.');
        }
      }
      return { payload, resolveType };
    }
  }

    createNotification(type: 'success' | 'info' | 'warning' | 'error', content, nzDuration, nzPlacement?): void {
       this.notification.remove();
        if (content !== null) {
            const mType = (type || 'INFO').toLowerCase();

            this.notification.create(mType, '', content,[], {
                nzDuration
            });
        }

    }

    // Fetch Cockpit Permissions
    fetchCreateCtaGranularActionPermission(){
      return this.http.get(API_ENDPOINTS.FETCH_USER_PERMISSIONS, {
        headers : {
          resourcetype : 'COCKPIT_GRANULAR_ACTION',
          resourcesource : 'MDA',
          resourceentityid : 'COCKPIT_GRANULAR_ACTION',
          bygroups : true
        }
      })
    }

    setCreateCtaGranularActionPermission(value: boolean){
      this.isCreateCtaGranularActionAllowed = value;
    }

    getCreateCtaGranularActionPermission(){
      return this.isCreateCtaGranularActionAllowed
    }
}
