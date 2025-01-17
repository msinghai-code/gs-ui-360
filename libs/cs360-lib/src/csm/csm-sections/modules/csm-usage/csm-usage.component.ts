import { Component, Inject, Input, OnInit, ElementRef } from '@angular/core';
import { ISection } from '@gs/cs360-lib/src/common';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { EnvironmentService } from '@gs/gdk/services/environment';
import {getCdnPath} from "@gs/gdk/utils/cdn";
import {IS_LEGACY_BROWSER} from "@gs/gdk/utils/common";

@Component({
  selector: 'gs-csm-usage',
  templateUrl: './csm-usage.component.html',
  styleUrls: ['./csm-usage.component.scss']
})
export class CsmUsageComponent implements OnInit {
  @Input() section: ISection;
  public elementTag : string;
  public url : string;
  constructor( @Inject('envService') public env: EnvironmentService,
  @Inject(CONTEXT_INFO) public ctx
  ) {}

 async ngOnInit() {

     // create the element tag and CDN URL to load ae360Section webcomponent
     this.elementTag = 'ae-360-section';
     const moduleUrl = this.env && this.env.gsObject && this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['ae-cs360'] : (await getCdnPath('ae-cs360'));

     if(moduleUrl){
         this.url = `${moduleUrl}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`
     } else {

         // for local testing uncomment this line and add script files in index.html except main.js
         // this.url = 'https://localhost:4200/main.js'

     }
 }

}
