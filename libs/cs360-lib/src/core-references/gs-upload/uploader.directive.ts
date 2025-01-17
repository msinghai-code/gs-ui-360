import {finalize} from 'rxjs/operators';
import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgModule,
  OnInit,
  Output,
  Renderer2
} from "@angular/core";

import {HttpProxyService} from "@gs/gdk/services/http";

export const GS_UPLOADER_EVENTS = {
  IMAGE_UPLOAD_FINISHED : "IMAGE_UPLOAD_FINISHED",
  IMAGE_UPLOAD_STARTED : "IMAGE_UPLOAD_STARTED",
  SIZE_LIMIT_EXCEEDED : "SIZE_LIMIT_EXCEEDED",
  UNSUPPORTED_FORMAT : "UNSUPPORTED_FORMAT"
}

@Directive({
  selector: "[gsUploader]"
})
export class GsUploaderDirective implements OnInit {

  @Input("maxSize") maxSize = 1024;
  @Input("context") context: string;
  @Input("formats") formats = [".jpeg", ".jpg", ".gif", ".png"];
  @Input("uploadURL") uploadURL;
  @Input("additionalRequestInfo") additionalRequestInfo : any = null;
  @Input("allowImageReplace") allowImageReplace = false;
  // If false, when a file is selected, it will not be uploaded directly. Instead consumer with run the method this.uploadFileToServer() to upload
  @Input() uploadAfterFileSelect = true;

  @Output()
  updates: EventEmitter<any> = new EventEmitter();

  lastUploadFormData: FormData;

  constructor(private _eleRef: ElementRef, private _renderer: Renderer2, private _http: HttpProxyService) { }

  @HostListener("click", ["$event"])
  onClick(evt: MouseEvent) {
    const target = evt.currentTarget as HTMLElement;
    const input = (target.querySelector("[type='file']") as HTMLInputElement);
    const image = (target.querySelector("img") as HTMLElement);

    if ((this.allowImageReplace || !image) && input) {
      input.click();
    }

    if (image && !this.allowImageReplace) {
      this.updates.emit({
        type: GS_UPLOADER_EVENTS.IMAGE_UPLOAD_FINISHED,
        data: { url: null, error: null }
      });
    }
  }

  ngOnInit(): void {
    this.initControl();
  }

  removeControl() {
    const fileInput = (this._eleRef.nativeElement as HTMLElement).querySelector("[type='file']");
    if (fileInput) {
      this._renderer.removeChild(this._eleRef.nativeElement, fileInput);
    }
  }

  initControl() {

    this.removeControl();
    const fileInput = this._renderer.createElement("input") as HTMLInputElement;
    this._renderer.setAttribute(fileInput, "type", "file");
    this._renderer.setAttribute(fileInput, "accept", this.formats.join(","));
    this._renderer.setStyle(fileInput, "display", "none");
    this._renderer.appendChild(this._eleRef.nativeElement, fileInput);
    this._renderer.listen(fileInput, "change", (evt) => {
      this.uploadFile(fileInput);
    });
  }
  
  public uploadFileToServer() {
    this._http
      .upload(this.uploadURL, this.lastUploadFormData).pipe(
      finalize(() => {
        this.initControl();
      }))
      .subscribe((res) => {
        this.updates.emit({
          type: "IMAGE_UPLOAD_FINISHED",
          data: { url: res.success ? res.data : null, error: !res.success ? res.error.message : null }
        });
      });
  }

  @HostListener("drop", ['$event']) uploadFile(fileInput: any,) {
    if(fileInput.dataTransfer) {
      fileInput.stopPropagation()
      fileInput.preventDefault();
    }
    const fileList: FileList = fileInput.files || fileInput.dataTransfer.files;
    if (fileList.length > 0 ) {
      for (let i = 0; i < fileList.length; i++) {
        const fileItem = fileList.item(i);
        const size = parseFloat((fileItem.size / 1000).toFixed(2));
        console.info(fileItem.name, `${size} kb`);
      }
      const file: File = fileList[0];

      // in Kb
      const fileSize = parseFloat((file.size / 1000).toFixed(2));
      if (fileSize > this.maxSize) {
        this.updates.emit({
          type: GS_UPLOADER_EVENTS.SIZE_LIMIT_EXCEEDED,
          data: { url:  null, error: "Exceeded the file size limit" }
        });
        return;
      }
      if(!((file.name.toLowerCase()).match(this.formats.join('|')))) {
        this.updates.emit({
          type: GS_UPLOADER_EVENTS.UNSUPPORTED_FORMAT,
          data: { url:  null, error: "file format not supported" }
        });
        return;
      }
      const formData: FormData = new FormData();
      formData.append("name", file.name);
      formData.append("file", file);
      formData.append("fileUploadContext", this.context);

      if(this.additionalRequestInfo){
        Object.keys(this.additionalRequestInfo).forEach(info =>{
          formData.append(info, this.additionalRequestInfo[info]);
        })
      }

      this.lastUploadFormData = formData;

      this.updates.emit({
        type: GS_UPLOADER_EVENTS.IMAGE_UPLOAD_STARTED,
        fileList
      });

      if(this.uploadAfterFileSelect) {
        this.uploadFileToServer();
      }
    } else {

    }
  }
  @HostListener("dragover", ["$event"]) onDragOver(evt: DragEvent) {
    evt.preventDefault()
  }

}

@NgModule({
  imports: [],
  exports: [GsUploaderDirective],
  declarations: [GsUploaderDirective]
})
export class GsUploaderModule { }
