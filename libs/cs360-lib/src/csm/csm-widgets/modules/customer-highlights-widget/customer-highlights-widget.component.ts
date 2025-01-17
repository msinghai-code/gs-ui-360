import {Component, Inject, OnInit} from '@angular/core';
import { IS_LEGACY_BROWSER } from '@gs/gdk/utils/common';
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { EnvironmentService } from '@gs/gdk/services/environment';

import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-customer-highlights-widget',
  templateUrl: './customer-highlights-widget.component.html',
  styleUrls: ['./customer-highlights-widget.component.scss']
})
export class CustomerHighlightsCsmComponent implements OnInit {

  elementTag = 'gs-customer-highlights-widget-element';
  url: string;

  constructor(@Inject("envService") public env: EnvironmentService, @Inject(CONTEXT_INFO) public ctx) { }

  async ngOnInit() {
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['customer-highlights'] : (await getCdnPath('customer-highlights'));
    this.url = `${moduleUrl }/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
    // this.url = "https://localhost:4201/main.js";
  }
}
