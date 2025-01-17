import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef, Inject, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzModalService } from '@gs/ng-horizon/modal';
import { SectionConfigurationComponent } from "../section-configuration.component";
import { SectionConfigurationService } from "../section-configuration.service";
import { MessageType } from '@gs/gdk/core';
import { APPLICATION_MESSAGES, APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import { SharedRouteOutletService } from "../../section-upsert/section-upsert.service";
import { LayoutUpsertService } from '../../../layout-configuration/layout-upsert/layout-upsert.service';
import { IADMIN_CONTEXT_INFO, ADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { SECTION_EVENTS } from '@gs/cs360-lib/src/common';
import {EnvironmentService} from "@gs/gdk/services/environment";
// import { CS360Service} from "@gs/cs360-lib";
import { NzI18nService } from "@gs/ng-horizon/i18n";
import {NzNotificationService} from "@gs/ng-horizon/notification";

@Component({
  selector: 'gs-global-section-configuration',
  templateUrl: './global-section-configuration.component.html',
  styleUrls: ['./global-section-configuration.component.scss']
})
export class GlobalSectionConfigurationComponent extends SectionConfigurationComponent implements OnInit {

  isRecentlySaved = false;
  
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    if(this.getIsChanged()) {
      event.returnValue = false;
    }
  }

  constructor(public router: Router, layoutUpsertService: LayoutUpsertService,
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
    public route: ActivatedRoute,
    protected cfr: ComponentFactoryResolver, protected viewContainerRef: ViewContainerRef,
    public sectionConfigurationService: SectionConfigurationService,
    public notification: NzNotificationService,
    public modalService: NzModalService,
    public sharedRouteOutletService: SharedRouteOutletService, i18nService: NzI18nService, @Inject("envService") public env: EnvironmentService) {
    super(router, layoutUpsertService, ctx, route, cfr, viewContainerRef, sectionConfigurationService, notification, modalService, sharedRouteOutletService, i18nService, env);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  configure() {
    const { label } = this.section;
    this.sharedRouteOutletService.emitChange(label);
  }

  sectionEventsHandler(event: any) {
    switch (event.type) {
      case SECTION_EVENTS.SECTION_LOAD_SUCCESS:
        setTimeout(() => {
          this.showFooter = this.sectionRenderer && this.sectionRenderer.sectionInstance && this.sectionRenderer.sectionInstance.showFooter ? this.sectionRenderer.sectionInstance.showFooter() : true;
          this.setFooterTemplate();
        });
        break;
    }
  }

  getSection(): any {
    const config = this.sectionRenderer.sectionInstance.toJSON();
    const { scope, sectionId, sectionType } = this.section;
    const { label, description } = config;
    delete config.label;
    delete config.description;
    delete config.configured;
    const payload = <any>{
      config,
      label: label || this.section.label,
      description: description || this.section.description,
      scope,
      sectionId,
      sectionType
    };
    if (!description && !this.section.description) {
      delete payload.description;
    }
    return payload;
  }

  navigateToSectionListing() {
    this.router.navigate([APPLICATION_ROUTES.COMMON_LAYOUTS]);
  }

  navigateToSectionDetails() {
    const { sectionId, label, description } = this.section;
    this.router.navigate([APPLICATION_ROUTES.SECTION_DETAILS(sectionId)], { state: { label, description } });
  }

  save() {
    const isSectionValid = this.validate();
    if (isSectionValid && this.sectionRenderer && this.sectionRenderer.sectionInstance && this.sectionRenderer.sectionInstance.toJSON) {
      this.isSaveIsInProgress = true;
      this.showHideLoaderInSection(true);
      const payload = this.getSection();
      this.sectionConfigurationService.saveSection(this.section.layoutId, payload).subscribe((response) => {
        this.isSaveIsInProgress = false;
        this.showHideLoaderInSection(false);
        if (response.result) {

          this.isRecentlySaved = true;

          // TODO: need to navigate to config screen
          const { layoutId, sectionId, scope } = this.section;
          let route: string;
          if (layoutId) {
            route = APPLICATION_ROUTES.LAYOUT_CONFIGURE(layoutId);
          } else if (sectionId) {
            route = APPLICATION_ROUTES.COMMON_LAYOUTS;
          }
          this.router.navigate([route], { queryParamsHandling: 'preserve' });
          // this.toastMessageService.add(APPLICATION_MESSAGES.SECTION_CONFIGURATION_SAVED, MessageType.SUCCESS, null, { duration: 5000 });
          this.notification.create('success','',this.i18nService.translate('360.admin.APPLICATION_MESSAGES.SECTION_CONFIGURATION_SAVED'),[], {nzDuration:5000});
        } else {
          // this.toastMessageService.add(APPLICATION_MESSAGES.SECTION_CONFIGURATION_SAVE_ERROR, MessageType.ERROR, null, { duration: 5000 });
          this.notification.create('error','',this.i18nService.translate('360.admin.APPLICATION_MESSAGES.SECTION_CONFIGURATION_SAVE_ERROR'),[],{nzDuration:5000});
        }
      });
    } else {
      console.log(`Heyy Developer, Seems JSON not valid OR Your Section doesnt have toJSON method on it, \n
        We use what ever is returned from you toJSON method and save it to the Database.\n
        Make sure Your section implements AdminSectionInterface
      `);
    }
  }

  getIsChanged() {
    return !this.isRecentlySaved && this.sectionRenderer.sectionInstance && this.sectionRenderer.sectionInstance.isConfigurationChanged && this.sectionRenderer.sectionInstance.isConfigurationChanged();
  }

}
