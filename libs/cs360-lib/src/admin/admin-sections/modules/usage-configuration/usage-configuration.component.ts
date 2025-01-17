import { Component, OnInit, Inject,ViewChild } from '@angular/core';
import { ISection } from '@gs/cs360-lib/src/common';
import AdminSectionInterface from '../AdminSectionInterface';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {getCdnPath} from "@gs/gdk/utils/cdn";
import {IS_LEGACY_BROWSER} from "@gs/gdk/utils/common";


@Component({
  templateUrl: './usage-configuration.component.html',
  styleUrls: ['./usage-configuration.component.scss']
})
export class UsageConfigurationComponent implements OnInit, AdminSectionInterface {
  loader:boolean = false;
  section: ISection;
  elementTag : string;
  url : string;
  @ViewChild('usage_configuration', {static: false}) usageComponent : any;

  constructor( @Inject('envService') private env : EnvironmentService,
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO) {}
    async ngOnInit() {

     // create the element tag and CDN URL to load usage configuration webcomponent
    this.elementTag = 'ae-360-section-configuration';
    const moduleUrl = this.env && this.env.gsObject && this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['ae-cs360'] : (await getCdnPath('ae-cs360'));
    if(moduleUrl){
      this.url = `${moduleUrl}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`

    } else{

      // for local testing uncomment this line and add script files in index.html except main.js
     // this.url = 'https://localhost:4200/main.js'

    }
  }

  validate() {
    return this.usageComponent.nativeElement.validate();
  }

  toJSON() {
   return this.usageComponent.nativeElement.toJSON();
  }
  showLoader(flag: any) {
    this.loader = flag;
  }

}
