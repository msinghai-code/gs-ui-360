import { Component, Inject, OnInit } from "@angular/core";
import { BaseSectionComponent } from '@gs/cs360-lib/src/common';
import { ICONTEXT_INFO, CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { EnvironmentService } from "@gs/gdk/services/environment";

@Component({
    selector: 'gs-csm-space-widget',
    templateUrl: './csm-space.component.html',
    styleUrls: ['./csm-space.component.scss']
})
export class CsmSpaceComponent extends BaseSectionComponent implements OnInit {
  elementTag = 'gs-space-csm-view';
  url: string;
  constructor(
    public env: EnvironmentService,
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) {
        super();
  }

  async ngOnInit() {
    console.log("In ctx of section");
    console.log(this.ctx);
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['space-csm'] : (await getCdnPath('space-csm'));
    this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
    // this.url = `https://localhost:4201/main.js`; //Point to local host if required
  } 
}