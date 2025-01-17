import { Component, Inject, OnInit } from '@angular/core';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';

@Component({
  selector: 'gs-community-widget-csm',
  templateUrl: './community-widget-csm.component.html',
  styleUrls: ['./community-widget-csm.component.scss']
})
export class CommunityWidgetCsmComponent implements OnInit {

  widgetItem:any;
  load = false;
  elementTag = 'gs-community-widget';
  url: string;
  moduleConfig;
  isPreviewSection: boolean = false;
  autonomousKey = 'community-widget';

  constructor(
    @Inject(CONTEXT_INFO) public ctx,
    public csmSummaryService: CsmSummaryService
  ) { }

  async ngOnInit() {
    this.isPreview();
    const moduleUrl = await getCdnPath(this.autonomousKey);
    this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`; //Point to local host if required
    this.load = true;
  }

  isPreview(){
    if(this.csmSummaryService.isPreviewMode){
      this.isPreviewSection = true;
    }
  }

}
