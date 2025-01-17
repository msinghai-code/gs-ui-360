import { Component, OnInit, Inject } from '@angular/core';
import { ICONTEXT_INFO, CONTEXT_INFO, isMini360 } from '@gs/cs360-lib/src/common';

import { getCdnPath } from '@gs/gdk/utils/cdn';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { EnvironmentService } from "@gs/gdk/services/environment";
@Component({
  selector: 'gs-csm-successplan',
  templateUrl: './csm-successplan.component.html',
  styleUrls: ['./csm-successplan.component.scss']
})
export class CsmSuccessplanComponent implements OnInit {
  elementTag = isMini360(this.ctx) ? 'gs-sp-mini360-widget' : 'gs-sp-widget';
  url: string;
  properties;
  constructor(
    public env: EnvironmentService,
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) {
  }

  async ngOnInit() {
    this.properties = {isNew360: true};
    let moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['sp-ngx-widget'] : (await getCdnPath('sp-ngx-widget'));

    if(moduleUrl && isMini360(this.ctx)) {
      moduleUrl += '/mini360';
    }

    this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
    //this.url = `https://localhost:4201/main.js`; //Point to local host if required
  }

}
