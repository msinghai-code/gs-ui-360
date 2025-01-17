import { Component, OnInit, ComponentFactoryResolver, TemplateRef, ViewChild, ViewContainerRef, AfterViewInit, Renderer2, AfterContentInit, OnDestroy, Inject, HostListener } from '@angular/core';
// import { AdminSectionRendererComponent, ADMIN_CONTEXT_INFO, APPLICATION_MESSAGES, APPLICATION_ROUTES, IADMIN_CONTEXT_INFO, ISection } from '@gs/cs360-lib';
import { AdminSectionRendererComponent } from '../../admin-sections/admin-section-renderer/admin-section-renderer.component';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { APPLICATION_MESSAGES, APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import { ISection } from '@gs/cs360-lib/src/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SectionConfigurationService } from './section-configuration.service';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { isEmpty, cloneDeep } from 'lodash';
import { LayoutSectionScope } from '../layout-upsert/layout-upsert.constants';
import { SharedRouteOutletService } from "../section-upsert/section-upsert.service";
import { SECTION_EVENTS } from '@gs/cs360-lib/src/common';
import { LayoutUpsertService } from '../layout-upsert/layout-upsert.service';
import { SubSink } from 'subsink';
import { NzDrawerPlacement } from '@gs/ng-horizon/drawer';
import { NzModalService } from '@gs/ng-horizon/modal';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { NzI18nService } from "@gs/ng-horizon/i18n";
import {NzNotificationService} from "@gs/ng-horizon/notification";
@Component({
  selector: 'gs-section-configuration',
  templateUrl: './section-configuration.component.html',
  styleUrls: ['./section-configuration.component.scss']
})
export class SectionConfigurationComponent implements OnInit, OnDestroy {
  addPrebuiltForm: FormGroup;
  placement: NzDrawerPlacement = 'left';
  visible: boolean = true;
  section: ISection;
  isSaveIsInProgress: boolean = false;
  showDetachModal = false;
  previewEnabled: { status: boolean, loading: boolean } = { status: false, loading: false };
  wrapperStyles: { padding: string, height: string } = {
    padding: '0px',
    height: 'calc(100% - 9rem)'
  };
  previewedSection: ISection;
  wrapperClassName = "gs-section-config-drawer";
  showFooter = true;
  loading = false;
  private subs = new SubSink();
  showWarningOnRouteChange = true;
  isPrebuiltAllowed = false;
  isPrebuiltDone = false;
  isPrebuiltModalVisible = false;
  prebuiltInput : string;
  prebuiltDescription : string;
  prebuiltType: string;
  isSectionlabel = false;
  // creating this to store deepCopy of section data to be returned as it is when unlinking cuz this.section is being passed down the hierarchy and internal properties are getting updated
  sectionConfigForUnlink;
  
 
 

  @ViewChild("sectionRenderer", { static: false }) public sectionRenderer: AdminSectionRendererComponent;
  @ViewChild('headerRef', { read: ViewContainerRef, static: false }) headerRef: ViewContainerRef;
  @ViewChild('footerRef', { read: ViewContainerRef, static: false }) footerRef: ViewContainerRef;
  @ViewChild('defaultHeaderRef', { static: true, read: TemplateRef }) defaultHeaderRef: TemplateRef<any>;
  @ViewChild('defaultFooterRef', { static: true, read: TemplateRef }) defaultFooterRef: TemplateRef<any>;
 
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    if(this.isConfigurationChanged()) {
      event.returnValue = false;
    }
  }
  
  constructor(public router: Router, public layoutUpsertService: LayoutUpsertService, @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO, public route: ActivatedRoute, protected cfr: ComponentFactoryResolver, protected viewContainerRef: ViewContainerRef,
    public sectionConfigurationService: SectionConfigurationService, public notification: NzNotificationService, public modalService: NzModalService, public sharedRouteOutletService: SharedRouteOutletService, public i18nService: NzI18nService,
    @Inject("envService") public env: EnvironmentService, public fb?: FormBuilder
  ) {
    const { snapshot: { data: { section } } } = this.route;
    section.isDetachSectionPreview = section.scope === LayoutSectionScope.GLOBAL && section.layoutId;
    this.ctx.relationshipTypeId = section.relationshipTypeId = this.route.snapshot.queryParams && this.route.snapshot.queryParams.typeId;
    this.section = section;
    this.sectionConfigForUnlink = cloneDeep(section);
    this.prebuiltInput = this.section.label; 
    this.prebuiltDescription = this.section.description;
    this.getConfiguredSections();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    this.subscribeForClose();
    this.subscribeForSave();
    this.subscribeForAddToPrebuilt();
    this.configure();
     
    const moduleConfig = this.env.moduleConfig
      moduleConfig.sections.find(element => {
        if(this.section.sectionType == element.sectionType){
        this.isPrebuiltAllowed = element.allowedInGlobalSection && !this.ctx.hidePrebuiltSectionsToConfigure;
        return;
        }
    });
   
     const { sectionNameCharLimit,sectionDescriptionCharLimit } = moduleConfig;
     this.addPrebuiltForm = this.fb && this.fb.group({
     name: [null, [Validators.required, extraSpaceValidator, Validators.maxLength(sectionNameCharLimit)]],
     description: [null, [Validators.maxLength(sectionDescriptionCharLimit)]]
    });
    
  }
  submitForm(): void {
    for (const i in this.addPrebuiltForm.controls) {
      this.addPrebuiltForm.controls[i].markAsDirty();
      this.addPrebuiltForm.controls[i].updateValueAndValidity();
    }
  }

  
   
  showprebuiltModal(): void {
    this.isPrebuiltModalVisible = true;
  }

  prebuiltSave(): void {
   this.isPrebuiltModalVisible = true;
   this.section.label = this.prebuiltInput;
   this.section.description = this.prebuiltDescription;
   this.isPrebuiltDone = true;
   const moduleConfig = this.env.moduleConfig
   moduleConfig.sections.find(element => {
    if(this.section.sectionType == element.sectionType){
      this.prebuiltType = element.label;
      return this.prebuiltType;
    }
   })
   this.save();
  }
  
   prebuiltCancel(): void {
    this.isPrebuiltModalVisible = false;
    this.prebuiltInput = this.section.label;
    this.prebuiltDescription = this.section.description;
    this.isPrebuiltDone =false;
  }
  
  private subscribeForClose() {
    this.subs.add(this.sectionConfigurationService.closeEventObservable.subscribe(evt => {
      this.close();
    }));
  }

  private subscribeForSave() {
    this.subs.add(this.sectionConfigurationService.saveEventObservable.subscribe(evt => {
      this.save();
    }));
  }

  private subscribeForAddToPrebuilt(){
    this.subs.add(this.sectionConfigurationService.addToPreBuiltEventObservable.subscribe(evt => {
      this.showprebuiltModal();
    }));
  }


  sectionEventsHandler(event: any) {
    switch (event.type) {
      case SECTION_EVENTS.SECTION_LOAD_SUCCESS:
        setTimeout(() => {
          this.showFooter = this.sectionRenderer && this.sectionRenderer.sectionInstance && this.sectionRenderer.sectionInstance.showFooter ? this.sectionRenderer.sectionInstance.showFooter() : true;
          this.setHeaderTemplate();
          this.setFooterTemplate();
        });
        break;
    }
  }

  private setHeaderTemplate() {
    if (this.sectionRenderer && this.sectionRenderer.sectionInstance && this.sectionRenderer.sectionInstance.getHeaderTemplateInfo) {
      const headerTemplateInfo = this.sectionRenderer.sectionInstance.getHeaderTemplateInfo();
      this.wrapperClassName = headerTemplateInfo.className;
      this.headerRef.createEmbeddedView(headerTemplateInfo.template);
    } else {
      this.headerRef.createEmbeddedView(this.defaultHeaderRef);
    }
  }

  setFooterTemplate() {
    this.footerRef && this.footerRef.clear();
    if (this.sectionRenderer && this.sectionRenderer.sectionInstance && this.sectionRenderer.sectionInstance.getFooterTemplateInfo) {
      const footerTemplateInfo = this.sectionRenderer.sectionInstance.getFooterTemplateInfo();
      this.wrapperClassName = footerTemplateInfo.className;
      this.footerRef && this.footerRef.createEmbeddedView(footerTemplateInfo.template);
    } else {
      this.footerRef && this.footerRef.createEmbeddedView(this.defaultFooterRef);
    }
  }

  close() {
    this.navigateToSectionListing();
  }

  public isConfigurationChanged() {
    if (this.sectionRenderer && this.sectionRenderer.sectionInstance && this.sectionRenderer.sectionInstance.isConfigurationChanged) {
      return this.showWarningOnRouteChange && this.sectionRenderer.sectionInstance.isConfigurationChanged();
    }
    console.warn('this.sectionRenderer.sectionInstance or this.sectionRenderer.sectionInstance.isConfigurationChanged does not exists. Returning false')
    return false;
  }

  navigateToSectionListing() {
    const route = APPLICATION_ROUTES.LAYOUT_CONFIGURE(this.section.layoutId);
    this.router.navigate([route], { queryParamsHandling: 'preserve' });
  }

  onDetachClick() {
    this.showDetachModal = true;
  }

  onDectachModalOkClick() {
      this.section['decoupled'] = true;
      this.showDetachModal = false;
      this.save(true);
  }

  checkForUnsavedChanges() {
    if (this.isConfigurationChanged()) {
      this.previewEnabled.loading = true;
    }

    this.section.config = this.sectionRenderer.sectionInstance.toJSON();
    this.previewedSection = cloneDeep({ ...this.section });
    this.previewEnabled.loading = false;
    this.previewEnabled.status = true;
  }

  getSection(fromDetach = false): any {
    const config = fromDetach ? this.sectionConfigForUnlink.config : this.sectionRenderer.sectionInstance.toJSON();
    const { label = this.section.label, description = this.section.description } = (config || {});
    
    if(config) {
      delete config.label;
      delete config.description;
      delete config.configured;
    }
    const payload = {
      ...this.section, 
      configured: !isEmpty(config),  
      config,
      label,
      description,
    };
    if (!description && !this.section.description) {
      delete payload.description;
    }
    return payload;
  }

  save(fromDetach?: boolean) {
    this.saveSection((response) => {
      // TODO: need to navigate to config screen
      this.showWarningOnRouteChange = false;
      if(!fromDetach) {
        const route = APPLICATION_ROUTES.LAYOUT_CONFIGURE(this.section.layoutId);
        this.router.navigate([route], { queryParamsHandling: 'preserve' });
        // this.toastMessageService.add(APPLICATION_MESSAGES.SECTION_CONFIGURATION_SAVED, MessageType.SUCCESS, null, { duration: 5000 })
        this.notification.create('success','',this.i18nService.translate('360.admin.APPLICATION_MESSAGES.SECTION_CONFIGURATION_SAVED'), [],{nzDuration:2000})
        this.isSectionlabel=false;
      } else {
        this.router.navigate([APPLICATION_ROUTES.SECTION_CONFIGURE(this.section.layoutId, response.data.sectionId)], { queryParamsHandling: 'preserve' });
      }
    }, fromDetach);
  }
 
  saveSection(successCallback, fromDetach?: boolean,) {
    this.isSectionlabel=true;
    const isSectionValid = fromDetach || this.validate();
    if (fromDetach  || isSectionValid && this.sectionRenderer && this.sectionRenderer.sectionInstance && this.sectionRenderer.sectionInstance.toJSON) {
      this.isSaveIsInProgress = true;
      this.showHideLoaderInSection(true);
      const payload = this.getSection(fromDetach);
      payload.addToPrebuild =  this.isPrebuiltDone ; 
      payload.entityType =  this.ctx.baseObject;
      payload.label = this.section.label;
      payload.description = this.section.description;
      payload.sectionLabel = this.prebuiltType;
      this.subs.add(this.sectionConfigurationService.saveSection(this.section.layoutId, payload).subscribe(response => {
        this.isSaveIsInProgress = false;
        this.showHideLoaderInSection(false);
        if (response.result) {
          successCallback(response);
          
        } 
        else {  
          // this.toastMessageService.add( response.error.message || APPLICATION_MESSAGES.SECTION_CONFIGURATION_SAVE_ERROR , MessageType.ERROR, null, { duration: 5000 });
          this.notification.create('error','', response.errorDesc || response.error.message || this.i18nService.translate('360.admin.APPLICATION_MESSAGES.SECTION_CONFIGURATION_SAVE_ERROR'),[], {nzDuration:5000});
          this.previewEnabled.status = false;
          this.previewEnabled.loading = false;
          this.isSectionlabel=false;
        }
  
      }));
    } else {
      this.isSectionlabel = false;
      console.log(`Heyy Developer, Seems JSON not valid OR Your Section doesnt have toJSON method on it, \n
        We use what ever is returned from you toJSON method and save it to the Database.\n
        Make sure Your section implements AdminSectionInterface
      `);
    } 
  }
  
  validate() {
    if (this.sectionRenderer && this.sectionRenderer.sectionInstance && this.sectionRenderer.sectionInstance.validate) {
      const response = this.sectionRenderer.sectionInstance.validate();
      if (typeof response === 'boolean') {
        return response;
      } else if (!response) {
        return response;
      } else {
        const { valid, message } = response;
        if (!valid) {      
          // this.toastMessageService.add(message, MessageType.WARN, null, { duration: 5000 });
          this.notification.create('warning','', message,[], {nzDuration:5000});
          this.previewEnabled.status = false;
          this.previewEnabled.loading = false;
        }
        return valid;
      }
    } else {
      return true;
    }
  }

  showHideLoaderInSection(isShow: boolean) {
    if (this.sectionRenderer.sectionInstance.showLoader) {
      this.sectionRenderer.sectionInstance.showLoader(isShow);
    }
  }

  onAction($event) {
  }

  configure() { }

  getConfiguredSections() {
    if (this.section && this.section.layoutId && (['SUMMARY'].indexOf(this.section.sectionType) > -1)) {
      const queryParams = this.route.snapshot.queryParams;
      const isPartner = queryParams.managedAs  &&  queryParams.managedAs === "partner" ? true : false;
      this.layoutUpsertService.getLayoutSections(this.section.layoutId, isPartner).subscribe((response: any) => {
        const configuredSections = (response && response.sections) || [];
        const moduleConfig = this.env.moduleConfig;
        this.env.moduleConfig = { ...moduleConfig, configuredSections };
        this.layoutUpsertService.destroyCache();
      });
    }
  }
  


  onSummaryActions(event) {
    switch(event.type) {
      case 'CLOSE': {
        this.previewEnabled.status = false;
      }
    }
  }

  showPreview() {
    this.checkForUnsavedChanges();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
