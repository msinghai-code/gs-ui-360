import {Component, Inject, Input, OnInit} from '@angular/core';
import {RelationshipSummaryRibbonViewService} from "../relationship-summary-ribbon-view.service";
import { GALAXY_ROUTE } from '@gs/cs360-lib/src/common';
import {isEmpty} from "@gs/ng-horizon/core";
import {EnvironmentService} from "@gs/gdk/services/environment";

@Component({
  selector: 'gs-summary-ribbon-attribute-view',
  templateUrl: './summary-ribbon-attribute-view.component.html',
  styleUrls: ['./summary-ribbon-attribute-view.component.scss']
})
export class SummaryRibbonAttributeViewComponent implements OnInit {

  @Input() attributesConfig: any;

  public loader: boolean = false;
  public loadSummaryRibbon = true;
  hasFLPErrors: boolean = false;
  errCodes = [
      'SCORECARD_9312', // This is FLP error from scorecard team
      'FIELD_PERMISSION_DENIED' // This is FLP error from NPS/CSAT team
  ];

  constructor(private relationshipSummaryRibbonViewService: RelationshipSummaryRibbonViewService, @Inject("envService") public _env: EnvironmentService) { }

  ngOnInit() {
    this.loader = true;
    this.relationshipSummaryRibbonViewService
        .fetchAttributeData(this.attributesConfig.config)
        .subscribe((data: any) => {
            const responseData = data.data || data; // Use data.data if available, otherwise use data
            this.hasFLPErrors = this.errCodes.includes(data.errorCode) || this.errCodes.includes(responseData.errorCode) || false;
            this.attributesConfig.item = {
               ...this.attributesConfig.item,
               data: !!responseData && responseData.length ? { ...responseData[0], label: this.attributesConfig.item.displayName } : { finalValue: 'NA', label: this.attributesConfig.item.displayName }
                };
            this.loader = false;
            if(this.attributesConfig.item.attributeId ==='Total_Relationships') {
                this.loadSummaryRibbon = true;
            } else if(this._env.gsObject.featureFlags['FIELD_LEVEL_PERMISSIONS']){
                this.loadSummaryRibbon = this.attributesConfig.item.config && !this.attributesConfig.item.config.hidden && !this.hasFLPErrors;
            }
        })
  }

  attributeEventHandler(evt) {}

}
