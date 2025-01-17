import {Component, Inject, OnInit, Input} from '@angular/core';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-csm-product-requests',
  templateUrl: './csm-product-requests.component.html',
  styleUrls: ['./csm-product-requests.component.scss']
})
export class CsmProductRequestsComponent implements OnInit {
  @Input() section;
  elementTag = 'gs-roadmap-tooling-widget';
  url: string;

  constructor(@Inject("envService") public env: EnvironmentService, @Inject(CONTEXT_INFO) public ctx) { }

  async ngOnInit() {
    if(this.section){
      this.ctx={...this.ctx,...this.section};
    }
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['roadmap-widgets'] : (await getCdnPath('roadmap-widgets'));
    this.url = `${moduleUrl || "https://localhost:4200"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
   // this.url = "https://localhost:4201/main.js";
  }
}
