import {Component, Inject, OnInit} from '@angular/core';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-csm-leads',
  templateUrl: './csm-leads.component.html',
  styleUrls: ['./csm-leads.component.scss']
})
export class CsmLeadsComponent implements OnInit {
  elementTag = 'gs-leads-c360-element';
  url: string;

  constructor(@Inject("envService") public env: EnvironmentService, @Inject(CONTEXT_INFO) public ctx) { }

  async ngOnInit() {
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['rc-widgets'] : (await getCdnPath('rc-widgets'));
    this.url = `${moduleUrl || "https://localhost:4200"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
    // this.url = "https://localhost:4200/main.js";
  }

}
