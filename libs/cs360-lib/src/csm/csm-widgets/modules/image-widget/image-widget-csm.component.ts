import {Component, ElementRef, Inject, OnInit, ViewChild, TemplateRef} from '@angular/core';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CsmWidgetBaseComponent } from '../csm-widget-base/csm-widget-base.component';
import { NzModalService } from '@gs/ng-horizon/modal';
import { APPLICATION_MESSAGES, ObjectNames } from '@gs/cs360-lib/src/common';
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { capitalize } from 'lodash';
import { PxService } from '@gs/cs360-lib/src/common';
import { PX_CUSTOM_EVENTS } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';
import {BehaviorSubject} from "rxjs";
import {NzDrawerService} from "@gs/ng-horizon/drawer";
import { UploadImageComponent } from './upload-image/upload-image.component';
import { Action } from 'rxjs/internal/scheduler/Action';

@Component({
  selector: 'gs-image-widget-csm',
  templateUrl: './image-widget-csm.component.html',
  styleUrls: ['./image-widget-csm.component.scss']
})
export class ImageWidgetCsmComponent extends CsmWidgetBaseComponent implements OnInit{
  openImageUploader: boolean;
  widgetImgAspectRatio = 0.5;
  widgetImgUrl: string;
  objectName: string;
  objectLabel: string; 
  isMini360: boolean = false;
  public drawerRef:any;
  private logoUpdateData$ = new BehaviorSubject({});
  @ViewChild('imgContainer', { static: false }) imgContainer: ElementRef;
  constructor(csmSummaryService: CsmSummaryService, private modalService: NzModalService, @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO, public pxService: PxService,
              private i18nService: NzI18nService, private drawerService: NzDrawerService) {
    super(csmSummaryService,ctx);
  }

  ngOnInit() {
    super.ngOnInit();
    this.isMini360 = isMini360(this.ctx);
  }

  uploadImage() {
    this.isMini360 = isMini360(this.ctx);
    this.openImageUploader = true;
    const img = this.imgContainer.nativeElement as HTMLElement;
    this.widgetImgAspectRatio = img.clientHeight / img.clientWidth;
    this.openImageUploaderDrawer();
  }

  openImageUploaderDrawer(){
    this.logoUpdateData$ = new BehaviorSubject({});
    this.drawerRef = this.drawerService.create({
      nzContent: UploadImageComponent,
      nzContentParams: {
        widgetItem: this.widgetItem,
        widgetImgAspectRatio: this.widgetImgAspectRatio,
        widgetImgUrl: this.widgetImgUrl,
        logoUpdateData$: this.logoUpdateData$,
      },
      nzBodyStyle: {'padding' : '16px 0 0 0'},
      nzWidth: this.isMini360 ? 840 : 588,
      nzHeight: 'calc(100% - 4.4rem)',
      nzMaskClosable: true,
      nzTitle:  this.i18nService.translate("360.csm.image_widget.uploadImage"),
      nzPlacement: 'right',
      nzOnCancel: (): Promise<boolean> => {
        this.drawerRef.close();
        return Promise.resolve(true);
      }
    });
    this.logoUpdateData$.subscribe((data:any) => {
      const { type } = data;
      if (type === 'CLOSE') {
        this.drawerRef.close();
      }
    });
}

  removeImage(){
    this.openRemoveImageConfirmationModal();
  }

  openRemoveImageConfirmationModal() {
    this.modalService.confirm({
      nzWrapClassName:"vertical-center-modal",
      nzTitle: this.i18nService.translate('360.csm.image_widget.removeImgTitle'),
      nzContent: this.i18nService.translate('360.csm.image_widget.removeImgMsg'),
      nzOnOk: () => {
        this.isLoading = true;
        this.csmSummaryService.removeImage({ 
          object: this.widgetItem.config.objectName,
          entityId: this.widgetItem.config.objectName === ObjectNames.COMPANY ? this.ctx.cId : this.ctx.rId,
          fieldName: this.widgetItem.config.fieldName,
        });
      },
      nzOkText: this.i18nService.translate('360.admin.common_layout.deleteModalOk')
    });
  }

  dataLoaded() {
    this.widgetImgUrl = this.data && this.data.v;
    this.objectName = capitalize(this.widgetItem.config.objectName);
    this.objectLabel = this.widgetItem.config.objectLabel || capitalize(this.widgetItem.config.objectName);
  }

}
