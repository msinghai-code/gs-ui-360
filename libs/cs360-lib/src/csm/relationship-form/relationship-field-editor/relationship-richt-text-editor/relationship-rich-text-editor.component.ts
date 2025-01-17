import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  FilterQueryService,
} from "@gs/gdk/filter/builder";
// import {
//   FieldEditorComponent,
// } from '../../../../../../portfolio-lib';
import { FieldEditorComponent, PortfolioWidgetService } from '@gs/cs360-lib/src/portfolio-copy';
// import { PortfolioWidgetService } from '../../../../../../portfolio-lib/src/portfolio-widget-grid/portfolio-widget.service';
import { RteFroalaOptions, RteOptions } from '@gs/gdk/rte/gs-rte.interface';
import {EnvironmentService, UserService} from '@gs/gdk/services/environment';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'relationship-rich-text-editor',
  templateUrl: './relationship-rich-text-editor.component.html',
  styleUrls: ['./relationship-rich-text-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelationshipRichTextEditor extends FieldEditorComponent implements OnInit {

  public lookupResultItems: any = {};
  @Input() rteOptions: Partial<RteOptions> = {
    autofocus: true,
    showActionButtons: false,
    migratingFromQuill: true,
    iframe: true,
  };

  froalaOptions: RteFroalaOptions | any = {
    autofocus: false,
    toolbarButtons: {
      moreText: {
        buttons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor'],
        buttonsVisible: 4,
      },
    
      moreParagraph: {
        buttons: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'formatOL', 'formatUL'],
        buttonsVisible: 4,
      },
    
      moreRich: {
        buttons: ['insertLink', 'clearFormatting'],
        buttonsVisible: 2,
      },
    },
    fontFamily: {
      "Arial, sans-serif": this.i18nService.translate('360.admin.font_family.arial'),
      "'Times New Roman', Times, serif": this.i18nService.translate('360.admin.font_family.times_new_roman'),
      "'Courier New', Courier, monospace": this.i18nService.translate('360.admin.font_family.courier_new'),
      "'Arial Black', sans-serif": this.i18nService.translate('360.admin.font_family.arial_black'),
      "'Arial Narrow', sans-serif": this.i18nService.translate('360.admin.font_family.arial_black'),
      "Tahoma, sans-serif": this.i18nService.translate('360.admin.font_family.tahoma'),
      "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif": this.i18nService.translate('360.admin.font_family.arial'),
      "Verdana, sans-serif": this.i18nService.translate('360.admin.font_family.verdana'),
      "Georgia, serif": this.i18nService.translate('360.admin.font_family.georgia'),
    },
    fontSize: ['10', '13', '16', '18', '24', '32', '48'],
    iframeStyle: `
      ul, ol { 
        padding-left: 40px !important;
      }

      p {
        margin: 0 !important;
      }
    `,
    toolbarInline: false,
  };

  @Input() content: any;
  @Input() field: any;
  @Output() onrtaEdit = new EventEmitter();

  constructor(public fqs: FilterQueryService,
     @Inject("envService") public _env: EnvironmentService,
    public _fb: FormBuilder,
    public portfolioWidgetService: PortfolioWidgetService,
    public ele: ElementRef,
    public userService: UserService,
    protected cdRef: ChangeDetectorRef,
    public i18nService?: NzI18nService
  ) {
    super(fqs, _env, _fb, portfolioWidgetService,userService, cdRef);
  }

  ngOnInit() {

    this.rteOptions = {
      ...this.rteOptions,
      readOnly : !this.field.editable ,
      onContentChanged: (value) => {
        this.onrtaEdit.emit({
          value,
          field: this.field,
        })
      }

    }
  }
}
