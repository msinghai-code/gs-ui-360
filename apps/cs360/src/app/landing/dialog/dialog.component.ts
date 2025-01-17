import { Component, Inject, OnInit, Input } from '@angular/core';
import {CS360Service} from "@gs/cs360-lib/src/common";
import { MessageType } from '@gs/gdk/core';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import {NzModalRef} from "@gs/ng-horizon/modal";

@Component({
  selector: 'gs-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  message: string;
  userDetails: any;
  @Input() data;

  constructor(private c360Service: CS360Service,
              private i18nService: NzI18nService, private modal: NzModalRef) {
  }

  ngOnInit() {
    this.userDetails = this.data;
  }

  close(action?: string) {
    this.modal.destroy(action)
  }

  revokeAccess() {
    this.c360Service.revokeAccess().subscribe((data) => {
      if (data.success) {
        // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.EMAIL_AUTHORIZATION_REVOKE_SUCCESS, MessageType.SUCCESS, null, { duration: 5000, horizontalPosition: 'start' });
        this.c360Service.createNotification("success",this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.EMAIL_AUTHORIZATION_REVOKE_SUCCESS'),5000,'bottomLeft');
        // this.close(MessageType.SUCCESS)
      } else {
        // this.toastMessageService.add(SUCCESS_SNAPSHOT_EXPORT_MESSAGES.EMAIL_AUTHORIZATION_REVOKE_FAIL, MessageType.ERROR, null, { duration: 5000,horizontalPosition: 'start' });
        this.c360Service.createNotification("error",this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.EMAIL_AUTHORIZATION_REVOKE_FAIL'),5000,'bottomLeft');
        // this.close();
      }
      this.modal.destroy('SUCCESS')
    });

  }

}
