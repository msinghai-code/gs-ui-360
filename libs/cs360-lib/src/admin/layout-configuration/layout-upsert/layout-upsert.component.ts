import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LayoutDetails } from './layout-upsert.interface';
import { SubSink } from 'subsink';
import { LayoutSteps, LayoutStepsLabels, LayoutStepsToIndexMap } from './layout-upsert.constants';
import { APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import { LayoutUpsertService, SharedRouteOutletService } from './layout-upsert.service';
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { EnvironmentService } from "@gs/gdk/services/environment"
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-layout-upsert',
  templateUrl: './layout-upsert.component.html',
  styleUrls: ['./layout-upsert.component.scss']
})
export class LayoutUpsertComponent implements OnInit, OnDestroy {

  current = 0;
  displayLayoutUpsert = true;
  header: string;
  layoutId: string;
  className: string;
  subHeader: string;
  isCreateMode: boolean;
  isPartner: boolean = false;
  tabs: any[];
  selectedIndex = 0;
  protected subs = new SubSink();

  constructor(
    protected route: ActivatedRoute,
    protected router: Router, 
    @Inject("envService") protected env: EnvironmentService,
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
    protected layoutUpsertService: LayoutUpsertService,
    protected sharedRouteOutletService: SharedRouteOutletService,
    protected cdr: ChangeDetectorRef,
    protected i18nService: NzI18nService) { }

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    if(queryParams.managedAs  &&  queryParams.managedAs === "partner") {
      this.isPartner = true;
    }
    this.associatedSubs();
    this.subs.add(this.route.data.subscribe(data => {
      const layoutDetails: LayoutDetails = data.details;
      const queryParams = this.route.snapshot.queryParams;
      this.tabs = this.getTabs(layoutDetails);
      if(queryParams.typeId) {
        const entType = this.env.moduleConfig[this.ctx.contextType].find(type => type.Gsid ===  queryParams.typeId);
        this.subHeader = entType.Name;
      }
      this.header = queryParams.name || layoutDetails.name || this.i18nService.translate('360.admin.layout_upsert.newLayout');
      this.layoutId = layoutDetails.layoutId;
      this.isCreateMode = this.route.snapshot.queryParams.mode === "create";
      this.className = this.isCreateMode ? "layout-upsert layout-upsert__create" : "layout-upsert layout-upsert__edit";
      if(this.isCreateMode) {
        this.setCurrentStepIndex(); 
        this.subscribeToRouteChange();
      } else {
        this.subscribeToStepChange();
      }
    }));
  }

  protected associatedSubs() {
    this.subs.add(
        this.sharedRouteOutletService
            .changeEmitted$
            .subscribe((label) => {
              this.header = label;
              this.cdr.detectChanges();
            })
    );
  }

  protected getTabs(details: LayoutDetails) {
      const tabs = [
          {
              label: this.i18nService.translate('360.admin.layout_upsert_constants.DETAILS'),
              link:LayoutSteps.DETAILS
          },
          {
              label: this.i18nService.translate('360.admin.layout_upsert_constants.CONFIGURE'),
              link:LayoutSteps.CONFIGURE
          },
          {
              label: this.i18nService.translate('360.admin.layout_upsert_constants.ASSIGN'),
              link:LayoutSteps.ASSIGN
          }
      ];

    if(details.default) {
      return tabs.filter(t => t.label !== this.i18nService.translate('360.admin.layout_upsert_constants.ASSIGN'));
    }
    return tabs;
  }

  protected subscribeToRouteChange() {
    this.subs.add(this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(params => {
      this.setCurrentStepIndex(); 
    }));
  }

  protected subscribeToStepChange() {
    this.subs.add(this.layoutUpsertService.setLayoutStepObservable.subscribe(step => {
      // TODO: need to handle this case. Will wait for NZTabs CanDeactivate.
        switch(this.route.firstChild.snapshot.url[0].path) {
            case LayoutSteps.DETAILS: this.selectedIndex = 0; break;
            case LayoutSteps.CONFIGURE: this.selectedIndex = 1; break;
            case LayoutSteps.ASSIGN: this.selectedIndex = 2; break;
        }
    }));
  }

  protected setCurrentStepIndex() {
    if(!this.route.firstChild.snapshot) {
      return;
    }
    
    switch(this.route.firstChild.snapshot.url[0].path) {
      case LayoutSteps.DETAILS: this.current = LayoutStepsToIndexMap.DETAILS; break;
      case LayoutSteps.CONFIGURE: this.current = LayoutStepsToIndexMap.CONFIGURE; break;
      case LayoutSteps.ASSIGN: this.current = LayoutStepsToIndexMap.ASSIGN; break;
    }
  }

  navigateBack() {
    let routerPath: string = this.isPartner ? APPLICATION_ROUTES.PARTNER_LAYOUTS : APPLICATION_ROUTES.STANDARD_LAYOUTS;
    this.router.navigate([routerPath]);
  }

  ngOnDestroy() {
    this.displayLayoutUpsert = false;
    this.layoutUpsertService.destroyCache();
    this.subs.unsubscribe();
  }

  onIndexChange(index: number): void {
    if(!this.layoutId) {
      return;
    }
    
    const routes: string[] = Object.values(LayoutSteps);
    this.router.navigate([routes[index]], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }

}
