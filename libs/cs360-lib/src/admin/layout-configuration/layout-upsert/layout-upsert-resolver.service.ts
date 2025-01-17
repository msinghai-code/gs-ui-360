import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve, CanDeactivate, Router } from '@angular/router';
import { forkJoin, Observable, Subject } from 'rxjs';
import { Section } from '../../admin-sections/modules/shared/section-listing/section-listing.interface';
import { WidgetCategoryType } from '@gs/cs360-lib/src/common';
import { LayoutSteps, LayoutSectionScope } from './layout-upsert.constants';
import { LayoutAssignMeta, LayoutDetails, LayoutSection, LayoutSectionsConfigureMeta } from './layout-upsert.interface';
import { LayoutUpsertService } from './layout-upsert.service';
import { map, isNull } from 'lodash';
import { LayoutDetailsComponent } from './layout-details/layout-details.component';
import { LayoutSectionsConfigureComponent } from './layout-sections-configure/layout-sections-configure.component';
import { LayoutAssignComponent } from './layout-assign/layout-assign.component';
import { NzModalService } from '@gs/ng-horizon/modal';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { EnvironmentService } from "@gs/gdk/services/environment"


@Injectable()
export class LayoutUpsertResolverService implements Resolve<LayoutDetails | LayoutSectionsConfigureMeta | LayoutAssignMeta> {

    constructor(private layoutUpsertService: LayoutUpsertService, 
        private router: Router,
        @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
        @Inject("envService") private env: EnvironmentService,private i18nService: NzI18nService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<LayoutDetails | LayoutSectionsConfigureMeta | LayoutAssignMeta> {
        return this.getRequiredMeta(route);
    }

    private getRequiredMeta(route: ActivatedRouteSnapshot): Observable<LayoutDetails | LayoutSectionsConfigureMeta | LayoutAssignMeta> {
        const typeId = route.parent.queryParams && route.parent.queryParams.typeId;
        let isPartner: boolean = false;
        if(this.ctx.contextTypeId) {
            this.ctx[this.ctx.contextTypeId] = typeId || null;
        } if(route.queryParams.managedAs  &&  route.queryParams.managedAs === "partner") {
            isPartner = true;
        } else if(this.router.url.includes('partner')) {
            isPartner = true;
        }
        switch (route.routeConfig.path) {
            case LayoutSteps.DETAILS:
                return this.getLayoutDetailsObservable(route.parent.params.layoutId, isPartner);
            case LayoutSteps.CONFIGURE:
                const configureObservable = new Observable(observer => {
                    forkJoin([this.getCommonSectionsObservable(isPartner), this.getLayoutSectionsObservable(route.parent.params.layoutId)]).subscribe(([globalSections, layoutDetails]) => {
                        const commonSections = this.getSectionCategories(globalSections, LayoutSectionScope.GLOBAL);
                        const localSections = this.env.moduleConfig.sections;
                        const standardSections = this.getSectionCategories(localSections, LayoutSectionScope.LOCAL);
                        let sectionCategories = [standardSections];
                        if(!this.ctx.hidePrebuiltSectionsToConfigure) {
                            sectionCategories.push(commonSections);
                        }
                        observer.next({ sectionCategories, layoutDetails });
                        observer.complete();
                    });
                });
                return configureObservable as any;
            case LayoutSteps.ASSIGN:
                const assignObservable = new Observable(observer => {
                    forkJoin([this.getLayoutDetailsObservable(route.parent.params.layoutId, isPartner), this.getLayoutAssignmentObservable(route.parent.params.layoutId)]).subscribe(response => {
                        const layoutDetails = response[0];
                        const layoutAssignInfo = response[1];
                        observer.next({ layoutDetails, layoutAssignInfo });
                        observer.complete();
                    })
                });
                return assignObservable as any;
            default:
                return this.getLayoutDetailsObservable(route.params.layoutId, isPartner);

        }
    }

    getSectionCategories(sections, scope) {
        const treeOptions = {
            isOutsideDroppable: true,
            isDragIndicatorRequired: true,
            isDataTypeIconRequired: false,
            validateDrop: true,
            filter: false,
            filterBy: "label"
        };
        sections = map(sections, section => {
            return { ...section, scope };
        }) as LayoutSection[];
        
        if (scope === LayoutSectionScope.GLOBAL) {
            return {
                 //{360.admin.layout_upsert_resolver.pre_built_sections}="Pre-built Sections"
                label: this.i18nService.translate('360.admin.layout_upsert_resolver.pre_built_sections'),
                id: LayoutSectionScope.GLOBAL,
                active: false,
                children: sections as Section[],
                treeOptions,
                widgetType: WidgetCategoryType.STANDARD,
                isLoading : false,
                scope
            };
        } else {
            return {
                //{360.admin.layout_upsert_resolver.sections}="Sections"
                id: LayoutSectionScope.LOCAL,
                label:  this.i18nService.translate('360.admin.layout_upsert_resolver.sections'),
                active: true,
                children: sections as Section[],
                widgetType: WidgetCategoryType.STANDARD,
                treeOptions,
                isLoading : false,
                scope
            };
        }
    }

    private getLayoutSectionsObservable(layoutId): Observable<LayoutDetails> {
        return new Observable(observer => {
            this.layoutUpsertService.getLayoutSections(layoutId).subscribe(layoutSectionsData => {
                observer.next(layoutSectionsData);
                observer.complete();
            })
        })
    }

    private getLayoutAssignmentObservable(layoutId): Observable<any> {
        return new Observable(observer => {
            this.layoutUpsertService.getLayoutAssignment(layoutId).subscribe(layoutAssignmentData => {
                observer.next(layoutAssignmentData);
                observer.complete();
            })
        })
    }

    private getLayoutDetailsObservable(layoutId: string, isPartner?: boolean): Observable<LayoutDetails> {
        // TODO: entity type to be dynamic
        return new Observable(observer => {
            if (layoutId === "new") {
                observer.next({
                    name: "",
                    layoutId: "",
                    description: "",
                    sectionCount: 0,
                    entityType: this.ctx.baseObject,//Cs360ContextUtils.getBaseObjectName(this.ctx),
                    // sharingType: LayoutSharingType.INTERNAL
                    sharingType: this.ctx.sharingType
                });
                observer.complete();
            } else {
                this.layoutUpsertService.getLayoutSections(layoutId, isPartner).subscribe(layout => {
                    observer.next(layout);
                    observer.complete();
                })
            }
        })
    }

    private getCommonSectionsObservable(isPartner?: boolean) {
        return new Observable(observer => {
            this.layoutUpsertService.getCommonSections(isPartner).subscribe(commonSections => {
                observer.next(commonSections);
                observer.complete();
            })
        })
    }
}


@Injectable()
export class CanDeactivateLayoutStep implements CanDeactivate<any> {

  constructor(private modal: NzModalService, private layoutUpsertService: LayoutUpsertService,private i18nService: NzI18nService) {}

  canDeactivate(
    component: LayoutDetailsComponent | LayoutSectionsConfigureComponent | LayoutAssignComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    if (!component.isCreateMode && component.getIsChanged()) {
        const subject = new Subject<boolean>();
        this.modal.confirm({
            //{360.admin.layout_upsert_resolver.title}='Unsaved Changes'
            //{360.admin.layout_upsert_resolver.content}='You have unsaved changes. Clicking Yes will discard the changes. Are you sure you want to proceed?'
            nzTitle:this.i18nService.translate('360.admin.layout_upsert_resolver.title'),
            nzContent:this.i18nService.translate('360.admin.layout_upsert_resolver.content'),
            nzOnOk: () => subject.next(true),
            nzOnCancel: () => {
                this.layoutUpsertService.resetLayoutUpsertStep(false);
                subject.next(false)
            },
             //{360.admin.layout_upsert_resolver.okText}='Yes'
             //{360.admin.layout_upsert_resolver.cancel}='Cancel'
            nzOkText: this.i18nService.translate('360.admin.layout_upsert_resolver.okText'),
            nzCancelText:this.i18nService.translate('360.admin.layout_upsert_resolver.cancel'),
        });
        return subject.asObservable();
    }
  
    return true;
  }
}
