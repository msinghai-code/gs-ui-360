import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GsUploaderDirective, GS_UPLOADER_EVENTS } from '@gs/cs360-lib/src/core-references';
import { CsmSummaryService } from './../../../../csm-sections/modules/csm-summary/csm-summary.service';
import { EventType } from '@gs/cs360-lib/src/common';
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { APPLICATION_MESSAGES, ObjectNames } from '@gs/cs360-lib/src/common';
import { ImageWidgetConstants } from '../image-widget-constants';
import { WidgetItemType } from '@gs/cs360-lib/src/common';
import { CS360Service } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'gs-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.scss']
})
export class UploadImageComponent implements OnInit {

  @Input() widgetItem: any;
  @Input() widgetImgAspectRatio: number;
  @Input() widgetImgUrl: string;
  private logoUpdateData$ = new BehaviorSubject({});
  maxImageSizeLimitInMb: number = ImageWidgetConstants.maxImageSizeLimitInMb * 1024;
  allowedFormats = [];
  uploadUrl = ImageWidgetConstants.uploadUrl;
  loading = false;
  uploading = false;
  previewImageUrl: string;
  fitToBox: boolean;
  additionalRequestInfo: any;
  error = false;
  imgContainerHeight:string = '270px';
  @ViewChild(GsUploaderDirective, { static: false}) uploader: GsUploaderDirective;
  @ViewChild("imagePreviewPlaceholder", { static: false }) imagePreviewPlaceholder: ElementRef;
  constructor(
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
    private csmSummaryService: CsmSummaryService,
    private cs360Service: CS360Service,
    private i18nService: NzI18nService
    ) {
  }

  hideWidgetLoader() {
    this.loading = false;
  }

  showWidgetLoader() {
    this.loading = true;
  }

  hidePreviewLoader() {
    this.uploading = false;
  }

  showPreviewLoader() {
    this.uploading = true;
  }

  loadPreview(fileList) {
    this.showPreviewLoader();

    const reader = new FileReader();
    const [file] = fileList;

    reader.readAsDataURL(file);

    reader.onload = () => {
      this.previewImageUrl = reader.result as string;
      this.hidePreviewLoader();
    }
  }

  ngOnInit() {
    this.cs360Service.getAllowedImageFormats().subscribe(data => {
      this.allowedFormats = data;
    })
    
    let upload_id =this.widgetItem.config.objectName === ObjectNames.COMPANY ? this.ctx.cId : this.ctx.rId;
    this.additionalRequestInfo = {
      metadata: JSON.stringify({
        objectType: this.widgetItem.config.objectName,
        gsid: upload_id,
        identifier: upload_id,
        fieldName: this.widgetItem.config && this.widgetItem.config.fieldName || 'Logo',
        update: 'true',
        // croppingDimensionsDTO: {
        //   xcoordinate: 0,
        //   ycoordinate: 0,
        //   width: 160,
        //   height: 100
        // }
      })
    };
  }

  ngAfterViewInit() {

    this.imgContainerHeight = this.widgetImgAspectRatio * this.imagePreviewPlaceholder.nativeElement.clientWidth + 'px';
  }

  onUpdate(evt) {
    switch (evt.type) {
      case GS_UPLOADER_EVENTS.IMAGE_UPLOAD_STARTED: {
        this.loadPreview(evt.fileList);
        break;
      }
      case GS_UPLOADER_EVENTS.IMAGE_UPLOAD_FINISHED: {
        try {
          if (evt.data.error) {
            // this.toastService.add(
            //   evt.data.error,
            //   MessageType.ERROR, null, { horizontalPosition: "left", duration: 5000 }
            // );
            this.cs360Service.createNotification('error', evt.data.error, 5000,'bottomLeft')
          } else {
            this.previewImageUrl = evt.data.url;
            this.csmSummaryService.dispatchWidgetEvent({ eventType: EventType.REFRESH, contextCategory: WidgetItemType.CR });
          }
        }
        catch (ex) {
          console.error(ex);
        }
        this.hideWidgetLoader();
        this.logoUpdateData$.next({ type: 'CLOSE' });
        break;
      }
      case GS_UPLOADER_EVENTS.SIZE_LIMIT_EXCEEDED: {
          const message = this.i18nService.translate(APPLICATION_MESSAGES.IMAGE_MAX_SIZE_EXCEED,{
              maxSizeInMb : ImageWidgetConstants.maxImageSizeLimitInMb})
        // this.toastService.add(
        //   APPLICATION_MESSAGES.IMAGE_MAX_SIZE_EXCEED(ImageWidgetConstants.maxImageSizeLimitInMb),
        //   MessageType.ERROR, null, { horizontalPosition: "left", duration: 5000 }
        // );
        this.cs360Service.createNotification('error',message , 5000, 'bottomLeft');
        this.hidePreviewLoader();
        break;
      }
      case GS_UPLOADER_EVENTS.UNSUPPORTED_FORMAT: {
        // this.toastService.add(
        //   APPLICATION_MESSAGES.IMAGE_FORMAT_SUPPORT,
        //   MessageType.ERROR, null, { horizontalPosition: "left", duration: 5000 }
        // );
        this.cs360Service.createNotification('error', this.i18nService.translate('360.admin.APPLICATION_MESSAGES.IMAGE_FORMAT_SUPPORT'),5000,'bottomLeft');
        this.hidePreviewLoader();
        break;
      }
    }
  }

  fitToBoxFn($event) {
    this.fitToBox = $event.checked;
  }

  get validate() {
    const validationErrors = [];
    return validationErrors;
  }

  save() {
    this.widgetImgUrl = this.previewImageUrl;

    this.showWidgetLoader();
    this.uploader.uploadFileToServer();
  }

  cancel() {
    this.hideWidgetLoader();
    this.logoUpdateData$.next({ type: 'CLOSE' });
  }

  onResize() {
  }

  getPropertiesToPersist() {
    return {
      fitToBox: this.fitToBox,
    };
  }

  onError() {
    this.hideWidgetLoader();
    this.error = true;
  }
}


