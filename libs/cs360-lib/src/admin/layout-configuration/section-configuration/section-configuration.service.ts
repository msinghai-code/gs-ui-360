import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, CanDeactivate, Router } from '@angular/router';
import {HttpProxyService} from "@gs/gdk/services/http";
import { Observable, of, Subject } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';
import { CS360CacheService } from '@gs/cs360-lib/src/common';
import { API_ENDPOINTS, APPLICATION_MESSAGES, APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import { SectionConfigurationComponent } from './section-configuration.component';
import { NzModalService } from '@gs/ng-horizon/modal';
import {NzI18nService} from "@gs/ng-horizon/i18n";


@Injectable({
  providedIn: 'root'
})
export class SectionConfigurationService {

  private closeEventSubject = new Subject<any>();
  private saveEventSubject = new Subject<any>();
  private addToPreBuiltEventSubject = new Subject<any>();

  public closeEventObservable = this.closeEventSubject.asObservable();
  public saveEventObservable = this.saveEventSubject.asObservable();
  public addToPreBuiltEventObservable = this.addToPreBuiltEventSubject.asObservable();

  constructor(private http: HttpProxyService, private cs360CacheService: CS360CacheService) { }

  emitCloseEvent() {
    this.closeEventSubject.next();
  }

  emitSaveEvent() {
    this.saveEventSubject.next();
  }

  emitPrebuilt(){
   this.addToPreBuiltEventSubject.next();
  }

  saveSection(layoutId: string, payload: any) {
    const { sectionId } = payload;
    if(layoutId) {
      return this.http.post(API_ENDPOINTS.SAVE_SECTION(layoutId), payload);
    } else {
      return this.http.post(API_ENDPOINTS.SAVE_GLOBAL_SECTION(sectionId), payload);
    }
  }

  detachSection(layoutId: string, sectionId: string) {
    return this.http.get(API_ENDPOINTS.DETACH_SECTION(layoutId, sectionId))
    .pipe(
      map(response => response.data)
    );
  }

  fetchPreviewRecords(payload: { limit: number, objectName: string, offset: number, select: string[], where?: any }, isDefault?: boolean) {
    const objectKey = `SUMMARY_${payload.objectName}`; // todo need to make it dynamic
    const objectCache = this.cs360CacheService.getCacheByKey(objectKey) || {};
    if (objectCache && objectCache.defaults && isDefault) {
      return of(objectCache.defaults);
    } else {
      return this.http.post(API_ENDPOINTS.GET_OBJECT_DATA(payload.objectName), payload).pipe(map((response: any) => {
        if (isDefault) {
          this.cs360CacheService.updateCache(objectKey, { defaults: response.data });
        }
        return response.data;
      }), publishReplay(1), refCount());
    }
  }
}

@Injectable()
export class SectionResolverService implements Resolve<any> {
  constructor(private http: HttpProxyService, private router: Router) { }
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const { params: { layoutId, sectionId } } = route;
    let isPartner: boolean = false;
    if(route.queryParams.managedAs  &&  route.queryParams.managedAs === "partner") {
        isPartner = true;
    }
    if(!!layoutId) {
      let url = API_ENDPOINTS.GET_SECTON(layoutId, sectionId);
      url = isPartner ? url + "?managedAs=partner" : url;
      return this.http.get(url).pipe(
        map(response => {
          if(response.success) {
            return { ...response.data, layoutId };
          } else {
            this.router.navigateByUrl(APPLICATION_ROUTES.LAYOUT_OR_SECTION_NOT_FOUND)
          }
        })
      );
    } else {
      return this.http.get(API_ENDPOINTS.GET_GLOBAL_SECTION(sectionId)).pipe(map(response => {
        return { ...response.data, sectionId };
      }));
    }
  }
}

@Injectable()
export class CanDeactivateSectionConfig implements CanDeactivate<any> {

  constructor(private modal: NzModalService, public i18nService: NzI18nService) { }

  canDeactivate(
    component: SectionConfigurationComponent,
  ): boolean | Observable<boolean> {
    if (component.isConfigurationChanged()) {
      
      const subject = new Subject<boolean>();
      this.modal.confirm({
        nzTitle: this.i18nService.translate(APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.TITLE),
        nzContent: this.i18nService.translate(APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.MESSAGE),
        nzOnOk: () => subject.next(true),
        nzOnCancel: () => {
          subject.next(false)
        },
        nzOkText: this.i18nService.translate(APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.OKTEXT),
        nzCancelText: this.i18nService.translate(APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.CANCELTEXT),

      });
      return subject.asObservable();
    }
    return true;
  }
}
