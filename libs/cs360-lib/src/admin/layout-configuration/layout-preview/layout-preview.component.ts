import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {LayoutPreviewService} from "./layout-preview.service";
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import { SubSink } from 'subsink';
import {Observable, Subject} from "rxjs";
import { PageContext } from '@gs/cs360-lib/src/common';
import {HybridHelper} from "@gs/gdk/utils/hybrid";
import {ActivatedRoute, Router} from "@angular/router";
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-layout-preview',
  templateUrl: './layout-preview.component.html',
  styleUrls: ['./layout-preview.component.scss']
})
export class LayoutPreviewComponent implements OnInit {

  @Input() params: any;
  @Output() close = new EventEmitter<any>();

  layoutId: string;
  isPartner: boolean = false;
  relationshipTypeId:string;
  layoutName$: Observable<string>;
  public recordDropdown = {
    selectedRecord: null,
    selectedObj: null,
    loading: false,
    options: [],
    searchControl: new Subject<string>()
  }
  private subs = new SubSink();
  enablePreviewBtn:boolean = false;
  title: string;

  constructor(private layoutPreviewService: LayoutPreviewService,
              private router: ActivatedRoute,
              private route: Router,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              private i18nService: NzI18nService) { }

  ngOnInit() {
    this.isPartner = this.route.url.includes('partner') ? true : false;
    this.subscribeForSearch();
    this.layoutId = this.params.layoutId;
    this.relationshipTypeId = (this.params.relTypeId === "null" || this.params.relTypeId === " ") ? null : this.params.relTypeId;
    this.layoutName$ = this.layoutPreviewService.fetchLayoutInfo(this.layoutId)
    this.fetchRecords();
    const entity = this.i18nService.translate(this.params.entity).toLowerCase();
    // 360.admin.layout_preview.preview_subheading =Select a {{enity}} to preview
    this.title = this.i18nService.translate('360.admin.layout_preview.preview_subheading',{entity});
  }

  subscribeForSearch() {
    this.subs.add(this.recordDropdown.searchControl.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((value: string) => {
      this.fetchRecords({ searchedValue: value });
    }));
  }

  fetchRecords(options: any = {}) {
    const objectName = this.ctx.baseObject;
    const payload = Cs360ContextUtils.getPreviewDataPayload(options.searchedValue, '', this.relationshipTypeId, 'AND');
    if(this.isPartner) {
      if(payload.where && payload.where.conditions) {
        const alpabetsArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        let usedAlias: any = {};
        let currentAlias = 'A';
        for(let condition of payload.where.conditions) {
          usedAlias[condition.alias] = true;
        } for(let alp of alpabetsArray) {
          if(!usedAlias[alp]) {
            currentAlias = alp;
            break;
          }
        }
        const managedByCondition = { alias: currentAlias, name: 'managedBy', operator: 'IS_NOT_NULL' }
        payload.where.conditions.push(managedByCondition);
        payload.where.expression = '(' + payload.where.expression + ') AND ' + currentAlias;
      } else {
        const managedByCondition = { alias: 'A', name: 'managedBy', operator: 'IS_NOT_NULL' };
        payload.where = { conditions: [], expression: 'A' };
        payload.where.conditions.push(managedByCondition);
      }
    }
    payload.objectName = objectName;
    this.recordDropdown.loading = true;
    this.layoutPreviewService
        .fetchPreviewRecords(payload)
        .subscribe((data) => {
          this.recordDropdown = {
            ...this.recordDropdown,
            loading: false,
            options: data.records
          }
        })
  }

  searchItemsForPreview(searchedValue: string) {
    this.recordDropdown.searchControl.next(searchedValue);
  }

  onItemDropdownOpen() {}

  onValueSelectedItemChange(evt: any) {
    if(!!evt) {
      this.recordDropdown = {
        ...this.recordDropdown,
        selectedRecord: evt
      }
      // Set it in sessionStorage
      if(sessionStorage) {
        try {
          sessionStorage.setItem('layoutId', this.layoutId);
        } catch (e) {
          throw new Error('Sessionstorage is not supported.');
        }
      }
      this.enablePreviewBtn =  true;
    } else {
      // DO Nothing
    }
  }

  reloadToEndUserPreview() {
    let url: string;
    url = HybridHelper.generateNavLink(`${this.ctx.previewConfig.previewPath}?${this.ctx.previewConfig.previewKey}=${this.recordDropdown.selectedRecord}&isp=true`);
    if(HybridHelper.isSFDCHybridHost()) {
      HybridHelper.navigateToURL(url, false);
    } else {
      window.open(url, '_self');
    }
  }

  closePreview() {
    this.close.emit();
  }

}
