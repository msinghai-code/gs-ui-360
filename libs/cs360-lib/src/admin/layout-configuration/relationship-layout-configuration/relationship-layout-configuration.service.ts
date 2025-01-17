import {Inject, Injectable} from '@angular/core';
import {HttpProxyService} from "@gs/gdk/services/http";
import {Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate} from "@angular/router";
import {forkJoin, Observable, of, Subject} from "rxjs";
import {isEmpty} from 'lodash';
import {API_URLS} from "../layout-configuration.constants";
import {map} from "rxjs/operators";
import { ConfigureComponent } from './configure/configure.component';
import { AssignComponent } from './assign/assign.component';
import { APPLICATION_MESSAGES } from '@gs/cs360-lib/src/common';
import { NzModalService } from '@gs/ng-horizon/modal';
import { EnvironmentService } from '@gs/gdk/services/environment';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Injectable({
  providedIn: 'root'
})
export class RelationshipSectionConfigurationService {

  constructor(private http: HttpProxyService,@Inject("envService") private env: EnvironmentService, private i18nService: NzI18nService) { }

  fetchAllRelationshipTypes(configId: string): Observable<any[]> {
    configId = configId === 'new'? null: configId;
    return this.http.get(API_URLS.RELATIONSHIP_SECTION_CONFIG.GET_RELATIONSHIP_TYPES(configId)).pipe(
        map(response => this.processRelationshipTypes(response.data))
    );
  }

  saveRelationshipConfig(payload) {
    return this.http.post(API_URLS.RELATIONSHIP_SECTION_CONFIG.SAVE_CONFIG(), payload)
                    .pipe(
                        map(response => response.data)
                    );
  }

  deleteRelationshipConfig(configId: string) {
    return this.http.delete(API_URLS.RELATIONSHIP_SECTION_CONFIG.DELETE_CONFIG(configId))
        .pipe(
            map(response => response.data)
        );
  }
//360.admin.relationshipConf.viewAssigned = View assigned already
  private processRelationshipTypes(relationshipTypes: any[]) {
    if(!isEmpty(relationshipTypes)) {
      return relationshipTypes.map(d => {
        return {
          label: d.configured ? d.relationshipTypeName+' ('+ this.i18nService.translate('360.admin.relationshipConf.viewAssigned')+ ')': d.relationshipTypeName,
          value: d.relationshipTypeId,
          disabled: d.configured,
          checked: d.selected
        };
      })
    }
  }

}

@Injectable({
  providedIn: 'root'
})
export class RelationshipConfigurationResolverService implements Resolve<any> {

  constructor(private http: HttpProxyService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    const { configId } =  route.params;
    return forkJoin({
      config: this.getRelationshipConfig(configId),
      bootstrap: this.getRelationshipConfigBootstrap()
    })
  }

  private getRelationshipConfig(configId: string) {
    if(configId === "new") {
      return of({});
    }
    return this.http.get(API_URLS.RELATIONSHIP_SECTION_CONFIG.GET_CONFIG(configId))
        .pipe(
            map(response => response.data)
        );
  }

  private getRelationshipConfigBootstrap() {
    return this.http.get(API_URLS.RELATIONSHIP_SECTION_CONFIG.GET_STANDARD_SUMMARY_RIBBON_CONFIG)
        .pipe(
            map(response => response.data)
        );
  }

}

@Injectable()
export class SharedLayoutRouteOutletService {
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
export class CanDeactivateConfig implements CanDeactivate<any> {

  constructor(private modal: NzModalService, private i18nService:NzI18nService) { }

  canDeactivate(
    component: ConfigureComponent | AssignComponent,
  ): boolean | Observable<boolean> {
    if (component.isConfigurationChanged()) {
      // console.log('- - > Changes detected!');
      
      const subject = new Subject<boolean>();
      this.modal.confirm({
        nzTitle: this.i18nService.translate(APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.TITLE),
        nzContent: this.i18nService.translate(APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.MESSAGE),
        nzOnOk: () => subject.next(true),
        nzOnCancel: () => {
          subject.next(false)
        },
        nzOkText: this.i18nService.translate(APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.OKTEXT),
        nzCancelText: this.i18nService.translate(APPLICATION_MESSAGES.SECTION_SETTING_CLOSE.CANCELTEXT)
      });
      return subject.asObservable();
    }
    // console.log('No Changes, passing ...');
    return true;
  }
}
