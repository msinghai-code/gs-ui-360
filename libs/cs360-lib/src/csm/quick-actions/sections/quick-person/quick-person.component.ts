import {Component, Inject, Input, OnInit} from '@angular/core';
import { IS_LEGACY_BROWSER } from "@gs/gdk/utils/common";
import { getCdnPath } from '@gs/gdk/utils/cdn';
import { EnvironmentService } from '@gs/gdk/services/environment';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
@Component({
  selector: 'gs-quick-person',
  templateUrl: './quick-person.component.html',
  styleUrls: ['./quick-person.component.scss']
})
export class QuickPersonComponent implements OnInit {
  elementTag = 'gs-add-person';
  url: string;
  section = null;
  constructor(@Inject("envService") public env: EnvironmentService,
              @Inject(CONTEXT_INFO) public ctx) {
  }

  async ngOnInit() {
    const personSection = this.env.moduleConfig.sections.filter((section)=>section.sectionType === "PERSON");
    if(personSection && personSection.length){
      this.section = personSection[0].config ? {config: personSection[0].config} : null;
    }
    // this.url = "https://localhost:4201/main.js";
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['people-section']
        : (await getCdnPath('people-section'));
    this.url = `${moduleUrl}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`;
  }

}

