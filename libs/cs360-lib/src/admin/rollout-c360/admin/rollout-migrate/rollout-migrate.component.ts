import { Component, OnInit } from '@angular/core';
import { RolloutC360Service } from "../../rollout-c360.service";
import { poller } from '@gs/cs360-lib/src/common';
import { Router } from "@angular/router";
import { MessageType } from '@gs/gdk/core';
import {NzNotificationService} from "@gs/ng-horizon/notification";
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-rollout-migrate',
  templateUrl: './rollout-migrate.component.html',
  styleUrls: ['./rollout-migrate.component.scss']
})
export class RolloutMigrateComponent implements OnInit {

  constructor(private rolloutC360Service: RolloutC360Service,
              private router: Router, private notification: NzNotificationService, private i18nService: NzI18nService) { }

  ngOnInit() {
      const routerState = this.router['lastSuccessfulNavigation'] && this.router['lastSuccessfulNavigation'].extras;
      const params = routerState && routerState.state;
      const queryParams = params ? params.queryParams : '';
      this.rolloutC360Service
          .startMigration(queryParams)
          .subscribe((data) => {
              if(data.success === false) {
                  this.openToastMessageBar({
                      message: this.i18nService.translate('360.admin.rollout_migrate.errMessage',{value:data.error.requestId}),
                      action: null,
                      messageType: MessageType.ERROR
                  });
              } else {
                  this.initiatePolling();
              }
          });

  }

    public openToastMessageBar({ message, action = "", messageType }) {
        if (message !== null) {
            // this.toastMessageService.add(message, messageType, action, { duration: 0 });
            this.notification.create(messageType,'', message, [],{nzDuration:0})
        }
    }

    initiatePolling() {
    poller(this.rolloutC360Service.getFeatureToggleInformation(), (status: any[])=>{
      const isMigrationDone: boolean = status.find(s => s.value === 'MIGRATION_DONE');
      if(isMigrationDone) {
        this.router.navigate(['standard']);
        this.rolloutC360Service.refreshFeatureFlagsOnServer().subscribe();
      }
      return isMigrationDone;
    }).subscribe();
  }

}
