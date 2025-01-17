import { Component, OnInit , Inject} from '@angular/core';
import { MessageType } from '@gs/gdk/core';
import { StateAction } from '@gs/gdk/core';
import {RolloutC360Service} from "../../rollout-c360.service";
import {Router} from "@angular/router";
import {NzNotificationService} from "@gs/ng-horizon/notification";
import {LAYOUT_LISTING_CONSTANTS} from "../../../layout-configuration/layout-listing/layout-listing.constants";
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import { SectionStateService } from '@gs/cs360-lib/src/common';
import { isEmpty } from 'lodash';
import {EnvironmentService} from "@gs/gdk/services/environment";

@Component({
  selector: 'gs-rollout-notification',
  templateUrl: './rollout-notification.component.html',
  styleUrls: ['./rollout-notification.component.scss']
})
export class RolloutNotificationComponent implements OnInit {
  buttonType:string = " ";
  switchValue:boolean = false;
  isBothText = false; 
  isSingleText = true;
  public isR360Enabled: boolean;
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
    handleCancelExplorer: this.handleCancelExplorer.bind(this),
    handleOkExplorer: () => {
      window.open('https://support.gainsight.com/Gainsight_NXT/07360/New_360_Experience/About', '_blank');
    }
  }
/*Reimports pnp usecase */
  public reMigrationModal = {
    mode: 'PUBLISH',
    isVisible: false,
    okLoading: false,
    handleCancelMigration: () => this.reMigrationModal.isVisible = false,
    handleOkMigration: this.handleProceed.bind(this)
}

  constructor(private rolloutC360Service :RolloutC360Service,
              protected notification: NzNotificationService,
              private router: Router,private stateService: SectionStateService, private i18nService: NzI18nService, @Inject("envService") public env: EnvironmentService) { }

  ngOnInit() {
    const GS = this.env.gsObject;
    this.isR360Enabled = GS.isRelationshipEnabled;
    const url: string = window.location.href;
      this.stateService.getAdminLevelState('try-horizon-360').subscribe(response =>{
        if(!isEmpty(response)){
            this.switchValue = response.state && response.state.switchValue;
        }})

  }

  onActivate(event?) {
    this.activationModal.isVisible = true;
  }

  onActivateExplorer(event?){
    if(!this.isR360Enabled){
      this.exploreModal.isVisible = true;
    }
  }

  handleCancel() {
    this.activationModal.isVisible = false;
  }
  handleCancelExplorer(){
      this.exploreModal.isVisible = false;
  }


  handleOk() {
    this.activationModal.okLoading = true;
    if(!this.isR360Enabled){
     this.exploreModal.okLoading = true;
    }
    this.rolloutC360Service.activateCS360({
      state: this.activationModal.mode
    }).subscribe((data) => {
      this.activationModal.okLoading = false;
      this.activationModal.isVisible = false;
      if(!this.isR360Enabled){
      this.exploreModal.okLoading = false;
      this.exploreModal.isVisible =false;
      }
      //this.reloadCurrentRoute();
      this.rolloutC360Service.refreshFeatureFlagsOnServer().subscribe();
      this.openToastMessageBar({message: this.i18nService.translate('360.admin.rollout_notification.enableSuccess'), action: null, messageType: MessageType.SUCCESS});
      setTimeout(() => window.location.reload(), 4000);
    });
  }

  handleOkExplorer(){
     this.exploreModal.okLoading = true;
    this.rolloutC360Service.activateCS360({
      state: this.activationModal.mode
    }).subscribe((data) => {
      if(!this.isR360Enabled){
      this.exploreModal.okLoading = false;
      this.exploreModal.isVisible =false;
      }
      //this.reloadCurrentRoute();
      this.openToastMessageBar({message: this.i18nService.translate('360.admin.rollout_notification.exploreOkText'), action: null, messageType: MessageType.SUCCESS});
      setTimeout(() => window.location.reload(), 4000);
    });
  }

  onAction(evt: StateAction) {
    switch (evt.type) {
      case 'ACTIVATION_MODE':
        this.activationModal.mode = evt.payload;
        break;
      default: null;
    }
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
  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  public openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000
      // });
      this.notification.create(messageType,'', message, [],{nzDuration:5000})
    }
  }

  public explore() {
    this.exploreModal.isVisible = true;
  }
  handleProceed() {
    this.router.navigate([APPLICATION_ROUTES.ADMIN_MIGRATE], { state: { MigrationStatus: "MIGRATION_READY", queryParams: 'remigrate=true' }});
    this.reMigrationModal.isVisible = false;
  }

  onRemigration(evt) {
    this.reMigrationModal.isVisible = true;
  }
}
