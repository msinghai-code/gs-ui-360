import {Inject, Injectable} from '@angular/core';
import {API_URLS} from "../layout-configuration.constants";
import {map} from "rxjs/operators";
import {HttpProxyService} from "@gs/gdk/services/http";
import { Subject, Observable } from 'rxjs';
import { API_ENDPOINTS } from '@gs/cs360-lib/src/common';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SectionDetailsComponent } from './section-details/section-details.component';
import { GlobalSectionConfigurationComponent } from '../section-configuration/global-section-configuration/global-section-configuration.component';
import { NzModalService } from '@gs/ng-horizon/modal';
import { EnvironmentService } from "@gs/gdk/services/environment"
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Injectable({
  providedIn: 'root'
})
export class SectionUpsertService {

  constructor(private http: HttpProxyService,@Inject("envService") private env: EnvironmentService) { }

  addSection(payload: any) {
    return this.http.post(API_URLS.LAYOUT_LISTING.ADD_SECTION, payload);
  }

  getSection(sectionId: string) {
    return this.http.get(API_ENDPOINTS.GET_GLOBAL_SECTION(sectionId))
        .pipe(
            map(response => {
              return { ...response.data, sectionId };
           })
        );
  }

  updateSection(sectionId: string, payload: any) {
    return this.http.post(API_URLS.LAYOUT_LISTING.UPDATE_SECTION(sectionId), payload);
  }

  cloneSection(payload): Observable<any> {
    return this.http.post(API_URLS.LAYOUT_LISTING.CLONE_SECTION, payload);
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


@Injectable()
export class CanDeactivateGlobalSectionStep implements CanDeactivate<any> {

  constructor(
    private modal: NzModalService,
    private i18nService: NzI18nService
    ) {}

  canDeactivate(component: SectionDetailsComponent | GlobalSectionConfigurationComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot): boolean | Observable<boolean> {
    if (component.getIsChanged()) {
      const observable = new Observable<boolean>(observer => {
        this.modal.confirm({
            nzTitle:  this.i18nService.translate('360.admin.section_upsert.modal_title'),
            nzContent: this.i18nService.translate('360.admin.section_upsert.modal_content'),
            nzOnOk: () => observer.next(true),
            nzOnCancel: () => {
                observer.next(false)
            },
            nzOkText: this.i18nService.translate('360.admin.section_upsert.modal_oktext'),
            nzCancelText:this.i18nService.translate('360.admin.section_upsert.modal_cancelText'),
        });
      });
      return observable;
    }
    return true;
  }
}
