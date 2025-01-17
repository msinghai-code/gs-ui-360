import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {Subject} from "rxjs";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import { SubSink } from 'subsink';
import {PreviewBannerService} from "./preview-banner.service";
import { CONTEXT_INFO, ICONTEXT_INFO, PageContext, Cs360ContextUtils } from "@gs/cs360-lib/src/common";
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-preview-banner',
  templateUrl: './preview-banner.component.html',
  styleUrls: ['./preview-banner.component.scss']
})
export class PreviewBannerComponent implements OnInit {

  public layoutData: any;
  public sectionLabel:any;
  public isStandardPage:boolean = false;
  public isPartnerPage: boolean = false;
  public isPartner: boolean = false;
  public recordDropdown = {
    selectedRecord: this.ctx.entityId,
    selectedObj: null,
    loading: false,
    options: [],
    searchControl: new Subject<string>()
  }
  public isRecordSearch:boolean = false;
  private subs = new SubSink();

  //{360.csm.preview_banner.company}=Company:
 // {360.csm.preview_banner.relationship}=Relationship:
 previewCompany =  this.i18nService.translate('360.csm.preview_banner.company')
 previewRelationship  = this.i18nService.translate('360.csm.preview_banner.relationship')

  constructor(private previewBannerService: PreviewBannerService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              @Inject("envService") private env: EnvironmentService, private i18nService :  NzI18nService) { }

  ngOnInit() {
    let sessionUrl = sessionStorage.getItem('previewCallBackURL');
    if(sessionUrl) {
      this.isPartner = sessionUrl.includes('partner');
    }
    if(sessionUrl === `${this.ctx.pageContext.toLowerCase()}#/standard`){
      this.isStandardPage = true;
      this.sectionLabel = this.i18nService.translate(this.ctx.previewConfig.previewBannerTitle);
    } else if(sessionUrl === `${this.ctx.pageContext.toLowerCase()}#/partner`){
      this.isPartnerPage = true;
      this.sectionLabel = this.i18nService.translate('360.admin.layout_listing.partnerLayoutsTab');
    } else {
      this.isStandardPage = false;
    }
    const GS = this.env.gsObject;
    this.bootstrapComponent();
    this.subscribeForSearch();
    this.routeData();
    this.fetchRecords({gsid: GS[this.ctx.uniqueIdentifierFieldName]});
  }

  bootstrapComponent() {
    const moduleConfig = this.env.moduleConfig;
    this.layoutData = !!moduleConfig ? moduleConfig.layoutData: {};
  }

  subscribeForSearch() {
    this.subs.add(this.recordDropdown.searchControl.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((value: string) => {
      this.fetchRecords({ searchedValue: value });
    }));
  }

  routeData() {

  }

  fetchRecords(options: any = {}) {
    const objectName = this.ctx.baseObject;
    const payload = Cs360ContextUtils.getPreviewDataPayload(options.searchedValue, '', this.ctx.relationshipTypeId,'AND');
    payload.objectName = objectName;
    this.recordDropdown.loading = true;
    if(this.isPartnerPage || this.isPartner) {
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
    this.previewBannerService
      .fetchPreviewRecords(payload)
      .subscribe((data) => {
        this.recordDropdown = {
          ...this.recordDropdown,
          loading: false,
          options: data.records
        }
        const name = this.ctx.pageContext === "C360" ? this.ctx.companyName : this.ctx.relationshipName;
        if (!this.isRecordSearch && !data.records.some(record => record.Name === name)) {
          this.recordDropdown.options.push({
            Gsid: this.ctx.pageContext === "C360" ? this.ctx.cId : this.ctx.rId,
            Name: this.ctx.pageContext === "C360" ? this.ctx.companyName : this.ctx.relationshipName
          });
        }
      })
    }

  searchItemsForPreview(searchedValue: string) {
    this.isRecordSearch = true;
    this.recordDropdown.searchControl.next(searchedValue);
  }

  onItemDropdownOpen() {}

  onValueSelectedItemChange(evt: any) {
    if(!!evt) {
      this.recordDropdown = {
        ...this.recordDropdown,
        selectedRecord: evt
      }
      this.reloadEndUserPreview();
    } else {
      // DO Nothing
    }
  }

  reloadEndUserPreview() {
    let url: string;
    url = HybridHelper.generateNavLink(`${this.ctx.previewConfig.previewPath}?${this.ctx.previewConfig.previewKey}=${this.recordDropdown.selectedRecord}&isp=true`);
    if(HybridHelper.isSFDCHybridHost()) {
      HybridHelper.navigateToURL(url, false);
    } else {
      window.open(url, '_self');
    }
  }


  close() {
    /*On close, redirecting to the screen which called this preview.*/
    let url = HybridHelper.generateNavLink(sessionStorage.getItem('previewCallBackURL'));
    if(!url) { // If url not found, redirect to admin landing page as fallback
      url = HybridHelper.generateNavLink(`${this.ctx.pageContext.toLowerCase()}#/standard`);
    }
    if(HybridHelper.isSFDCHybridHost()) {
      HybridHelper.navigateToURL(url, false);
    } else {
      window.open(url, '_self');
    }
  }

}
