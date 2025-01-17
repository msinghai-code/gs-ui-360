import {Component, EventEmitter, OnInit, Input, Inject, ChangeDetectorRef, Output} from '@angular/core';
import { MessageType } from '@gs/gdk/core';
import { StateAction } from '@gs/gdk/core';
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import { DescribeService } from "@gs/gdk/services/describe";
import {DialogComponent} from "../../dialog/dialog.component";
import {CONTEXT_INFO, CS360Service, ICONTEXT_INFO, PageContext, PX_CONSTANTS} from "@gs/cs360-lib/src/common";
import {NzContextMenuService} from "@gs/ng-horizon/dropdown";
// import {MatDialog} from "@angular/material/dialog";
import { DOCUMENT } from '@angular/common';
import { filter } from 'lodash';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { NzI18nService } from '@gs/ng-horizon/i18n';
import {NzModalService} from "@gs/ng-horizon/modal";

@Component({
  selector: 'gs-share-ss-dropdown',
  templateUrl: './share-ss-dropdown.component.html',
  styleUrls: ['./share-ss-dropdown.component.scss']
})
export class ShareSsDropdownComponent implements OnInit {
  public successSnapshotEnabled: boolean = true;
  public visible: boolean;
  public isLoading: boolean;
  public showListing: boolean;
  public isAuthenticated: boolean;
  public snapshot: any;
  public successPlans: any = [];
  public showEntity: any;
  public selectedUser: any = [];
  public recipients: any = [];
  public sPAccessCheck: boolean;
  public rShipAccessCheck: boolean;
  public sPReportPresent: boolean
  public rShipReportPresent: boolean;
  public showShare360 = false;
  public pxClasses;
  @Input() snapshots: Array<any>;
  @Input() options: any;
  @Output() action = new EventEmitter<StateAction>();
  @Input() isSsHaEnabled: boolean;
  googleSlidesEnabled: boolean = false;
  userDetails: any;
  photoLink: any;
  email: any;
  showHybridOptions = false;
  showViewRelatedContacts = false;
  public verticalScrollOptions: any = {
    enabled: false,
    onScrollModeChange: this.onScrollModeChange.bind(this)
  }
  isInConsole:boolean;
  isParentLightning:boolean;

  constructor(@Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              @Inject("envService") private _env: EnvironmentService,
              private cdr: ChangeDetectorRef,
              private c360Service: CS360Service,
              private nzContextMenuService: NzContextMenuService,
              private modalService: NzModalService,
              @Inject(DOCUMENT) private document: Document,
              private _ds: DescribeService,
              private i18nService: NzI18nService) {
      this.pxClasses =  PX_CONSTANTS.SHARE_SS_DROPDOWN(this.ctx.pageContext);
  }

  async ngOnInit() {
    this.isInConsole = await HybridHelper.isInConsole();
    this.isParentLightning =  await HybridHelper.isUserPreferencesLightningExperiencePreferred();
    const featureFlags = this._env.gsObject.featureFlags;
    this.showHybridOptions = this.ctx.aId && HybridHelper.isSFDCHybridHost();
    if (featureFlags && featureFlags.SS_GOOGLE_SLIDE_ENABLE) {
      this.googleSlidesEnabled = featureFlags.SS_GOOGLE_SLIDE_ENABLE;
      this.setUserDetails();
      this.cdr.detectChanges();
    }
    this.showEntity = this.ctx.pageContext === 'C360' ? 'ACCOUNT': 'RELATIONSHIP';
    if (featureFlags) {
      if (featureFlags.RELATIONSHIP) {
        this.rShipAccessCheck = featureFlags.RELATIONSHIP;
      }
      if (featureFlags.SUCCESS_PLAN) {
        this.sPAccessCheck = featureFlags.SUCCESS_PLAN;
      }
    }
    this.c360Service.getExternalSharingLayouts(this.ctx.pageContext).subscribe(response => {
      let layouts = response && response.data || [];
      if(this.ctx.pageContext === PageContext.R360) {
        layouts = filter(layouts, (layout)=>{
          return layout["relationshiptype_id"] == this.ctx.relationshipTypeId;
        });
      }
      if(layouts && layouts.length > 0) {
        this.showShare360 = true;
      }
    })
    this.verticalScrollOptions = {
      ...this.verticalScrollOptions,
      enabled: this.options.loadAll
    }
    this.checkIfAccountContactRelationExists();
  }

  private checkIfAccountContactRelationExists() {
		if(this.ctx.pageContext === PageContext.C360 && HybridHelper.isSFDCHybridHost()) {
			this._ds.getDescribedObject(
				{ id: '', name: 'SFDC', type: 'SFDC' },
				"AccountContactRelation",
				false, false, false
			).then(data => {
				if((data && data["AccountContactRelation"]) || (data && data["objectName"] === "AccountContactRelation")) {
					this.showViewRelatedContacts = true;
				}
			}).catch(e => {
			});

		}
	}

  shareSnapshot(event) {
    this.visible = false;
  }

  onSnapshotSelect(event,snapshot) {
    this.snapshot = snapshot;
    const payload: any = ["relationship", "successplan"];
    this.sPReportPresent = false;
    this.rShipReportPresent = false;
    this.c360Service.checkForSPAndRelationshipAccess(payload, this.snapshot.ssId).subscribe((response: any) => {
      if(response.success) {
        this.sPReportPresent = response.data.successplan;
        this.rShipReportPresent = response.data.relationship;
      }
      if ((!this.sPAccessCheck && this.sPReportPresent) && (!this.rShipAccessCheck && this.rShipReportPresent)) {
        // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_AND_RELATIONSHIPS_REPORTS, MessageType.INFO, '', {duration: 5000});
        this.c360Service.createNotification('info',this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_AND_RELATIONSHIPS_REPORTS'),5000);
      } else if ((!this.sPAccessCheck && this.snapshot.successplanPresent) && (!this.rShipAccessCheck && this.rShipReportPresent)) {
        // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_AND_RELATIONSHIPS_REPORTS, MessageType.INFO, '', {duration: 5000});
        this.c360Service.createNotification('info',this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_AND_RELATIONSHIPS_REPORTS'),5000);
      }else if (!this.rShipAccessCheck && this.snapshot.entity === 'Relationship') {
        // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIPS_AS_ENTITY, MessageType.INFO, '', {duration: 5000});
         this.c360Service.createNotification('info',this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIPS_AS_ENTITY'),5000);
      } else if (!this.sPAccessCheck && this.snapshot.successplanPresent) {
        // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SP_ACCESS_REQUIRED, MessageType.INFO, '', {duration: 5000});
        this.c360Service.createNotification('info',this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SP_ACCESS_REQUIRED'),5000);
      } else if(!this.sPAccessCheck && this.sPReportPresent) {
        // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_REPORTS, MessageType.INFO, '', {duration: 5000});
        this.c360Service.createNotification('info',this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_REPORTS'),5000);
      } else if(!this.rShipAccessCheck && this.rShipReportPresent) {
        // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIP_REPORTS, MessageType.INFO, '', {duration: 5000});
        this.c360Service.createNotification('info',this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIP_REPORTS'),5000);
      } else {
        if (this.snapshot.successplanPresent) {
          let id = this.ctx.pageContext === 'C360' ? this.ctx.cId : this.ctx.rId;
          this.c360Service.getSuccessPlans(this.snapshot.entity, id).subscribe((successPlans) => {
            this.successPlans = successPlans.data;
            this.cdr.detectChanges();
          });
        }

        let user = this._env.user;
        if (this.selectedUser.length === 0 || (this.selectedUser.forEach((item) => item.id === user.id) === -1)) {
          this.selectedUser.push({email: user.email, gsid: user.id, name: user.name});
          this.recipients = this.selectedUser;
        }

        if (snapshot.storageType === 'S3') {
          this.visible = true;
        } else if (snapshot.storageType !== 'S3') {
          this.checkForAuthentication(true)
        }
      }
    });

  }

  checkForAuthentication(checkAuth) {
    this.c360Service.checkAuthentication().subscribe((response) => {
      if (response.data && response.data.exists) {
        this.isAuthenticated = true;
        this.visible = true;
        this.fetchGooglePpts()
      } else if(response.data && response.data.authorizationUrl && checkAuth) {
        const popup =  window.open(response.data.authorizationUrl, '_blank', "toolbar=yes,scrollbars=yes,resizable=yes,top=300,left=300,width=500,height=600");
        const popupTick = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(popupTick);
            this.checkForAuthentication(false);
            this.setUserDetails();
          }
        }, 500);
      } else {
        // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.AUTHENTICATION_FAILED, MessageType.ERROR, null, { duration: 5000, horizontalPosition: 'start' });
        this.c360Service.createNotification('error',this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.AUTHENTICATION_FAILED'),5000,'topLeft');
      }

    })
  }

  setUserDetails() {
    this.c360Service.getUserDetails().subscribe((res) => {
      if (res) {
        this.userDetails = res;
        this.c360Service.setUserDetails = res;
        this.photoLink = this.userDetails ? this.userDetails.photoLink : '';
        this.email = this.userDetails ? this.userDetails.emailAddress : '';
      }
    })
  }

  fetchGooglePpts() {
    this.showListing = true;
  }

  close() {
    this.visible = false;
  }

  openRevokeDialogue() {
    const modal = this.modalService.create({
      nzContent: DialogComponent,
      nzWidth: '330px',
      nzClosable: true,
      nzMaskClosable: false,
      nzClassName: 'dialog-modal',
      nzWrapClassName: 'ant-modal-centered',
      nzComponentParams: {data: this.userDetails }
    });

    modal.afterClose.subscribe((result) => {
        if (result === 'SUCCESS') {
          this.photoLink = undefined;
          this.email = undefined;
          this.userDetails = undefined;
        }
    })

  }

  onSSAction(event) {
    switch (event.type) {
      case 'SHARE':
        this.visible = false;
        this.isLoading = false;
        let data = event.data;
        if (event.success) {
          if (event.storageType === 'S3') {
            // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SUCCESS_SNAPSHOT_EXPORT_SUCCESS, MessageType.SUCCESS, null, {duration: 3000, horizontalPosition: 'start'})
            this.c360Service.createNotification('success',this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SUCCESS_SNAPSHOT_EXPORT_SUCCESS'),3000,'topLeft');
          } else {
            // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SUCCESS_SNAPSHOT_EXPORT_TO_GOOGLE_ACCOUNT_SUCCESS, MessageType.SUCCESS, null, {duration: 3000,horizontalPosition: 'start'})
            this.c360Service.createNotification('success',this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SUCCESS_SNAPSHOT_EXPORT_TO_GOOGLE_ACCOUNT_SUCCESS'),3000,'topLeft');
          }
        } else {
          // this.toastMessageService.add(data.errorDesc || data.error.message || SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SUCCESS_SNAPSHOT_EXPORT_FAIL, MessageType.ERROR, null, {duration: 3000, horizontalPosition: 'start'})
          this.c360Service.createNotification('error',data.errorDesc || data.error.message || this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SUCCESS_SNAPSHOT_EXPORT_FAIL'),3000,'topLeft');
        }
        break;
      case 'LOADING':
        this.isLoading = true;
        break;
      case 'CANCEL':
        this.visible = false;
        break;
    }
  }

  onScrollModeChange(evt: any) {
    console.log(evt);
    this.action.emit({
      type: 'VERT_SCROLL_CHANGE',
      payload: evt
    });
  }


  public openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Service.createNotification(messageType,message,5000);
    }
  }

  handleHybridNavigations(action: string) {
    let link;
    let lightning_link;
    switch(action)  {
      case 'ACCOUNT':
        link = '/' + this.ctx.aId;
        lightning_link = link;
        break;
      case 'OPPORTUNITY':
        link = '/006?rlid=RelatedOpportunityList&id=' + this.ctx.aId;
        lightning_link = `/lightning/r/` + this.ctx.aId + `/related/Opportunities/view`;
        break;
      case 'CONTACTS':
        link = '/003?rlid=RelatedContactList&id=' + this.ctx.aId;
        lightning_link = `/lightning/r/`  + this.ctx.aId + `/related/Contacts/view`;
        break;
      case 'ACCOUNT-CONTACT-RELATIONS':
        link = '/07k?rlid=RelatedAccountContactRelationList&id=' + this.ctx.aId;
        lightning_link = `/lightning/r/AccountContactRelation/` + this.ctx.aId + `/related/AccountContactRelations/view`
        break;
    }

    const basePath = this._env.gsObject.sfDomainURL || window.location.origin;

    link = `${basePath}${link}`;
    lightning_link = `${basePath}${lightning_link}`;

    const linkToNavigate = HybridHelper.isLightningEnabled() || this.isParentLightning ? lightning_link : link;

    if(this.isInConsole) {
      HybridHelper.navigateToURL(linkToNavigate, true);
    } else {
      window.open(linkToNavigate, "_blank");
    }
  }

  navigateToShare360(){
    const ctxUrl = this.ctx.pageContext === 'C360'? `/v1/ui/externallayoutspreview?cid=${this.ctx.entityId}` : `/v1/ui/externallayoutspreview?rid=${this.ctx.entityId}`;
    if(HybridHelper.isSFDCHybridHost()) {
      const link = HybridHelper.generateNavLink(ctxUrl);
      HybridHelper.navigateToURL(link, true);
    } else {
      window.open(ctxUrl, "_blank");
    }
  }

}
