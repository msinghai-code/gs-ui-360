import {Component, Inject, OnInit} from '@angular/core';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-quick-enhancement-request',
  templateUrl: './quick-enhancement-request.component.html',
  styleUrls: ['./quick-enhancement-request.component.scss']
})
export class QuickEnhancementRequestComponent implements OnInit {

  elementTag = 'gs-enhancement-request-form-widget';
  url: string;
  properties = {};
  section = null;

  constructor(
      @Inject("envService") public env: EnvironmentService,
      @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
  ) { }

    async ngOnInit() {
    const erSection = this.env.moduleConfig.sections.filter((section)=>section.sectionType === "PRODUCT_REQUESTS");
    if(erSection && erSection.length){
      this.section = erSection[0].config ? {config: erSection[0].config} : null;
    }
    this.properties = {
      context : this.ctx,
      section: this.section
    }
    // this.url = "https://localhost:4201/main.js";
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['roadmap-widgets']
        : (await getCdnPath('roadmap-widgets'));
    this.url = `${moduleUrl}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
  }

}
