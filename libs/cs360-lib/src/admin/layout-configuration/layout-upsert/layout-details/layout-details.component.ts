import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutDetails } from '../layout-upsert.interface';
import {LayoutUpsertService, SharedRouteOutletService} from '../layout-upsert.service';
import { SubSink } from 'subsink';
import { APPLICATION_ROUTES, PageContext } from '@gs/cs360-lib/src/common';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { MessageType } from '@gs/gdk/core';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { LayoutConfigurationService } from '../../../layout-configuration/layout-configuration.service';
import { EnvironmentService } from "@gs/gdk/services/environment"
// import { CS360Service} from "@gs/cs360-lib";
import { CS360Service } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-layout-details',
  templateUrl: './layout-details.component.html',
  styleUrls: ['./layout-details.component.scss']
})
export class LayoutDetailsComponent implements OnInit,OnDestroy {

  detailsForm: FormGroup;
  layoutId: string;
  loading = false;
  isCreateMode: boolean;
  layoutDetails: LayoutDetails;
  relationshipTypes = [];
  showRelationshipTypeSelection = false;
  showRelChangeBanner:boolean = false;
  isPartner: boolean = false;
  cloneFrom: string;
  cloneSourceRelType : any;
  targetRelType : any;

  protected subs = new SubSink();
  
  constructor(
    protected fb: FormBuilder,
    protected layoutUpsertService: LayoutUpsertService,
    @Inject("envService") protected env: EnvironmentService,
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
    protected c360Service: CS360Service,
    protected route: ActivatedRoute, protected router: Router,
    public layoutConfigurationService: LayoutConfigurationService,
    protected sharedRouteOutletService: SharedRouteOutletService,
    protected i18nService: NzI18nService) { }

  ngOnInit() {
    this.subs.add(this.route.data.subscribe(data => {
      const queryParams = this.route.snapshot.queryParams;
      const moduleConfig = this.env.moduleConfig;
      this.relationshipTypes = moduleConfig && moduleConfig.relationshipTypes;
      this.cloneFrom = queryParams.cloneFrom;
      if(this.cloneFrom && this.relationshipTypes) {
        this.cloneSourceRelType = this.relationshipTypes.find(rt=> rt.Gsid == queryParams.typeId);
      }
      if(queryParams.managedAs  &&  queryParams.managedAs === "partner") {
        this.isPartner = true;
      }
      this.layoutDetails = data.details;
      const { layoutNameCharLimit, layoutDescriptionCharLimit } = moduleConfig;
       //{360.admin.layout_upsert.copy_of}=Copy of
      this.detailsForm = this.fb.group({

        name: [(queryParams.name && this.i18nService.translate('360.admin.layout_upsert.copy_of') + ' ' + queryParams.name) || this.layoutDetails.name, [Validators.required, extraSpaceValidator, Validators.maxLength(layoutNameCharLimit)]],
        // relationshipTypeId: this.ctx.pageContext === PageContext.R360 ? [queryParams.typeId || this.ctx.relationshipTypeId , [Validators.required]] : [""], 
        relationshipTypeId: this.ctx.contextTypeId ? [queryParams.typeId || this.ctx[this.ctx.contextTypeId] , [Validators.required]] : [""], 
        description: [this.layoutDetails.description, [Validators.maxLength(layoutDescriptionCharLimit)]]
      });
      this.listenToFormChanges();
      this.layoutId = this.layoutDetails.layoutId;
      this.isCreateMode = queryParams.mode === "create";
      if(this.isCreateMode && !this.layoutId) {
        let title = this.i18nService.translate('360.admin.layout_upsert.newLayout');
        if(this.cloneFrom) {
          title = this.i18nService.translate('360.admin.layout_upsert.copy_of') + ' ' + queryParams.name;
        }
        this.sharedRouteOutletService.emitChange(title);
      }
      // this.showRelationshipTypeSelection = this.ctx.pageContext === PageContext.R360;
      this.showRelationshipTypeSelection = this.ctx.standardLayoutConfig.groupByType ? true : false;
    }));
  }

  listenToFormChanges(){
    this.detailsForm.valueChanges.subscribe(({relationshipTypeId}) => {
      if(this.relationshipTypes) {
        this.targetRelType = this.relationshipTypes.find(rt=> rt.Gsid == this.detailsForm.get("relationshipTypeId").value);
        this.showRelChangeBanner = this.cloneFrom && (relationshipTypeId != this.cloneSourceRelType.Gsid);
      }
    });
  }

  submitForm(): void {
    for (const i in this.detailsForm.controls) {
      this.detailsForm.controls[i].markAsDirty();
      this.detailsForm.controls[i].updateValueAndValidity();
    }
  }

  getIsChanged() {
    return this.detailsForm.dirty;
  }

  onSaveAsDraftClick() {
    this.onSaveClick(true);
  }

  onSaveClick(isDraftClick?: boolean) {
    this.submitForm();
    if(this.detailsForm.valid) { 
      this.loading = true;
      if(this.cloneFrom && !this.layoutId) {
        const { name, description, relationshipTypeId } = this.detailsForm.getRawValue();
        this.layoutConfigurationService
          .cloneLayout({
            layoutId: this.cloneFrom,
            name: name.trim(),
            description,
            relationshipTypeId,
            entityType: this.ctx.baseObject,
          })
          .subscribe((response) => {
            if(response.result) {
              this.detailsForm.markAsPristine();
              this.navigateToConfigure(response.data.layoutId, response.data.relationshipTypeId, { cloneFrom: null, name: null });
            } else if(response.error) {
              // this.toastMessageService.add(response.error.message, MessageType.ERROR, null, { duration: 5000 });
              this.c360Service.createNotification('error',response.error.localizedMessage || response.error.message,5000);
            }
            this.loading = false;
          });
        return;
      }
      if(!this.isCreateMode) {
        this.subs.add(this.layoutUpsertService.getLayoutSections(this.layoutDetails.layoutId).subscribe(response => {
          this.layoutDetails = response;
          this.updateLayout(isDraftClick);
        }))
      } else {
        this.updateLayout(isDraftClick);
      }
      
    }
  }

  protected updateLayout(isDraftClick?: boolean) {
    const { name, description, relationshipTypeId } = this.detailsForm.getRawValue();
    let layoutDetails: LayoutDetails = {
      ...this.layoutDetails,
      name: name.trim(),
      description,
      relationshipTypeId,
      layoutId: this.layoutId
    }
    if(this.isPartner) {
      layoutDetails.managedAs = "PARTNER"
    }
    this.subs.add(this.layoutUpsertService.upsertLayout(layoutDetails).subscribe(response => {
      this.loading = false;
      if(!response.success) {
        // this.toastMessageService.add(response.error.message, MessageType.ERROR, null, { duration: 5000 });
        this.c360Service.createNotification('error', response.error.localizedMessage || response.error.message,5000);
        return;
      } 
      this.layoutId = response.data.layoutId || this.layoutId;
      if(isDraftClick) {
        let routerPath: string = this.isPartner ? APPLICATION_ROUTES.PARTNER_LAYOUTS : APPLICATION_ROUTES.STANDARD_LAYOUTS;
        this.router.navigate([routerPath]);
        return;
      }
      this.detailsForm.markAsPristine();
      this.navigateToConfigure(this.layoutId, this.detailsForm.get("relationshipTypeId").value);
      this.loading = false;
    }));
  }

  navigateToConfigure(layoutId, typeId?, additionalParams = {}) {
    // if(this.ctx.pageContext === PageContext.R360) {
    if(this.ctx.contextTypeId) {
      this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(layoutId)], {queryParams: { typeId, ...additionalParams }, queryParamsHandling: 'merge' });
    } else {
      this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(layoutId)], { queryParams: additionalParams, queryParamsHandling: 'merge' });
    }
  }

  public openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Service.createNotification(messageType, message, 5000);
    }
  }

  onCancelClick() {
    let routerPath: string = this.isPartner ? APPLICATION_ROUTES.PARTNER_LAYOUTS : APPLICATION_ROUTES.STANDARD_LAYOUTS;
    this.router.navigate([routerPath]);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
