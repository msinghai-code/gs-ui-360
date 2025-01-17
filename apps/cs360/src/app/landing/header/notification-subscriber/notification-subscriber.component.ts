import { Component, OnInit, Input, Inject } from '@angular/core';
import { isEmpty } from "lodash";
import { NotificationSubscriberService } from "./notification-subscriber.service";
import { MessageType } from '@gs/gdk/core';
import {NzModalService} from "@gs/ng-horizon/modal";
//import { CONTEXT_INFO, ICONTEXT_INFO } from '../../../../../../../libs/cs360-lib';
import {CONTEXT_INFO, CS360CacheService, CS360Service, ICONTEXT_INFO, PageContext, QuickActionContext, PX_CONSTANTS} from '@gs/cs360-lib/src/common';
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-notification-subscriber',
  templateUrl: './notification-subscriber.component.html',
  styleUrls: ['./notification-subscriber.component.scss']
})
export class NotificationSubscriberComponent implements OnInit {

  @Input() entityId: string;

  @Input() entityName: string; // Relationship

  public subscribeData: any;
  public following: boolean;
  public isLoading: boolean;
  public buttonText: string = this.i18nService.translate('360.csm.notification_subscriber.follow');
  public followText = this.i18nService.translate('360.csm.notification_subscriber.follow');
  public showIcon: boolean = true;
  public pxClasses;
    public followTooltip;
    public unfollowTooltip

  constructor(private notificationSubscriberService: NotificationSubscriberService,
              private modalService: NzModalService,
              private c360Service: CS360Service,
              private i18nService: NzI18nService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) {
      this.pxClasses =  PX_CONSTANTS.NOTIFICATION_SUBSCRIBER(this.ctx.pageContext);
      this.followTooltip = this.i18nService.translate('360.csm.notification_subscriber.followTooltip',{companyName: this.ctx.companyName});
      this.unfollowTooltip = this.i18nService.translate('360.csm.notification_subscriber.unfollowTooltip',{companyName: this.ctx.companyName});
  }

  ngOnInit() {
    this.getSubscribedInfo();
  }
  
  private getSubscribedInfo() {
    this.notificationSubscriberService
        .getSubscribedInfo(this.entityId)
        .subscribe((data) => {
          this.subscribeData = data;
          this.following = !isEmpty(this.subscribeData) ? this.subscribeData.isSubscribed: false;
          // Change button text based on subscribe status
          this.buttonText = this.changeButtonText();
        });
  }

  public toggleNotification() {
    const { id = "" } = this.subscribeData || {};
    let subs;
    this.isLoading = true;
    // {360.csm.notification_subscriber.modalOkText}=Proceed
    // {360.csm.notification_subscriber.modalTitle}=Do you want to Unfollow?
    // {360.csm.notification_subscriber.modalContent}=Click <b>Proceed</b> to unfollow the {{value}} company and stop receiving notifications from them. Are you sure you want to proceed?
    if(this.following) {
      subs = this.notificationSubscriberService
          .unsubscribeNotification(this.entityName, this.entityId, id);
      // Open a modal popup
      this.modalService.confirm({
        nzOkText: this.i18nService.translate('360.csm.notification_subscriber.modalOkText'),
        nzTitle: this.i18nService.translate('360.csm.notification_subscriber.modalTitle'),
        nzContent: this.i18nService.translate('360.csm.notification_subscriber.modalContent',{value: this.ctx.companyName}),
        nzOnOk: () => {
          subs.subscribe(this.subsCallback.bind(this));
        },
        nzOnCancel: () => {
          this.isLoading = false;
        }
      });
    } else {
      subs = this.notificationSubscriberService
          .subscribeNotification(this.entityName, this.entityId, id);
      subs.subscribe(this.subsCallback.bind(this));
    }
  }

  subsCallback(data: any): void {
    this.isLoading = false;
    this.subscribeData = data;
    if(!isEmpty(this.subscribeData)) {
      this.following = !isEmpty(this.subscribeData) ? this.subscribeData.isSubscribed: false;
      // Change button text based on subscribe status
      this.buttonText = this.changeButtonText();
      if(this.following) {
        // {360.csm.notification_subscriber.subscribeSuccess}=Subscribed successfully
        this.openToastMessageBar({message: this.i18nService.translate('360.csm.notification_subscriber.subscribeSuccess'), action: null, messageType: MessageType.SUCCESS});
      } else {
        // {360.csm.notification_subscriber.unsubscribeSuccess}=Unsubscribed successfully
        this.openToastMessageBar({message: this.i18nService.translate('360.csm.notification_subscriber.unsubscribeSuccess'), action: null, messageType: MessageType.SUCCESS});
      }
    } else {
      // {360.csm.notification_subscriber.subscribeFailed}=Failed to subscribe. Please try later.
      this.openToastMessageBar({message: this.i18nService.translate('360.csm.notification_subscriber.subscribeFailed'), action: null, messageType: MessageType.ERROR});
    }
  }
// {360.csm.notification_subscriber.following}=Following
// {360.csm.notification_subscriber.follow}=Follow
// {360.csm.notification_subscriber.unfollow}=Unfollow
  public onMouseOver() {
    if(this.following) {
      this.showIcon = false;
    }
    this.buttonText = this.following ?this.i18nService.translate('360.csm.notification_subscriber.unfollow'): this.buttonText;
  }

  public onMouseOut() {
    this.buttonText = this.following ? this.i18nService.translate('360.csm.notification_subscriber.following'): this.buttonText;
    if(this.following) {
      this.showIcon = true;
    }
  }

  private changeButtonText(): string {
    return this.following ? this.i18nService.translate('360.csm.notification_subscriber.following'): this.i18nService.translate('360.csm.notification_subscriber.follow');
  }

  public openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Service.createNotification(messageType, message, 5000);
    }
  }

}
