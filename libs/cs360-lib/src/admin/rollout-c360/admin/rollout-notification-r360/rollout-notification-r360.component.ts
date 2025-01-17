import {Component, Inject, OnInit} from '@angular/core';
import { MessageType } from '@gs/gdk/core';
import { StateAction } from '@gs/gdk/core';
import {HybridHelper} from "@gs/gdk/utils/hybrid";
import {RolloutC360Service} from "../../rollout-c360.service";
import {Router} from "@angular/router";
import { APPLICATION_ROUTES, PageContext } from '@gs/cs360-lib/src/common';
import { SectionStateService } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { isEmpty } from 'lodash';
import {NzNotificationService} from "@gs/ng-horizon/notification";

import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-rollout-notification-r360',
  templateUrl: './rollout-notification-r360.component.html',
  styleUrls: ['./rollout-notification-r360.component.scss']
})
export class RolloutNotificationR360Component implements OnInit {

  isBothText = true; 
  isSingleText = false;

  buttonType:string = " ";
  switchValue:boolean = false;

  step1Title = this.i18nService.translate('360.admin.rollout_notification.step1Title');
  step2Title = this.i18nService.translate('360.admin.rollout_notification.step2Title');
  step1BtnText = this.i18nService.translate('360.admin.rollout_notification.step1BtnText');
  step2BtnText = this.i18nService.translate('360.admin.rollout_notification.step2BtnText');

  public index: number = 1;
  public activationModal = {
    mode: 'PUBLISH',
    isVisible: false,
    okLoading: false,
    handleCancel: this.handleCancel.bind(this),
    handleOk: this.handleOk.bind(this)
  }
  public exploreModal = {
    isVisible: false,
    okLoading: false,
    handleCancel: () => this.exploreModal.isVisible = false,
    handleOk: () => {
      window.open('https://support.gainsight.com/Gainsight_NXT/07360/New_360_Experience/About', '_blank');
    }
  }
    public reMigrationModal = {
        mode: 'PUBLISH',
        isVisible: false,
        okLoading: false,
        handleCancel: () => this.reMigrationModal.isVisible = false,
        handleOk: this.handleProceed.bind(this)
    }
  constructor(private rolloutC360Service :RolloutC360Service,
              protected notification: NzNotificationService, private router: Router,
              private stateService: SectionStateService,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              private i18nService: NzI18nService) { }

  ngOnInit() {
    const url: string = window.location.href;
      this.stateService.getAdminLevelState('try-horizon-360').subscribe(response =>{
        if(!isEmpty(response)){
            this.switchValue = response.state && response.state.switchValue;
        }})    
    if(url.includes('c360')) {
      this.index = 1;
    } else if(url.includes('r360')) {
      this.index = 2;
    } else {
      this.index = 1;
    }

    if(this.index === 1){
      this.buttonType= "primary";
    }
    else {
      this.buttonType= "default";
    }

  }

  handleProceed() {
    this.router.navigate([APPLICATION_ROUTES.ADMIN_MIGRATE], { state: { MigrationStatus: "MIGRATION_READY", queryParams: 'remigrate=true' }});
    this.reMigrationModal.isVisible = false;
  }

  clickSwitch() {
    const url: string = window.location.href;
      this.stateService.saveState({
          referenceId: 'try-horizon-360',
          moduleName:'c360',
          state: {
            switchValue: this.switchValue
          },
      }).subscribe();
  }

  onActivate(evt) {
    this.activationModal.isVisible = true;
  }

  onRemigration(evt) {
      this.reMigrationModal.isVisible = true;
  }

  onContinue(index) {
    switch (index) {
      case 1:
        this.reloadPage('r360');
        break;
      case 2:
        this.reloadPage('c360');
        break;
      default: null
    }
  }

  handleCancel() {
    this.activationModal.isVisible = false;
  }

  handleOk() {
    this.activationModal.okLoading = true;
    this.rolloutC360Service.activateCS360({
      state: this.activationModal.mode
    }).subscribe((data) => {
      this.activationModal.okLoading = false;
      this.activationModal.isVisible = false;
      this.rolloutC360Service.refreshFeatureFlagsOnServer().subscribe();
      this.openToastMessageBar({message: this.i18nService.translate('360.admin.rollout_notification.enableSuccess'), action: null, messageType: MessageType.SUCCESS});
      setTimeout(() => this.reloadPage('c360'), 4000);
    });
  }

  reloadPage(pageName: string): void {
    const url = HybridHelper.generateNavLink(pageName);
    if(HybridHelper.isSFDCHybridHost()) {
      HybridHelper.navigateToURL(url, false);
    } else {
      window.open(url, '_self');
    }
  }

  onAction(evt: StateAction) {
    switch (evt.type) {
      case 'ACTIVATION_MODE':
        this.activationModal.mode = evt.payload;
        break;
      default: null;
    }
  }

  explore() {
    this.exploreModal.isVisible = true;
  }

  public openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000
      // });
      this.notification.create(messageType,'', message, [],{nzDuration:5000})
    }
  }

}
