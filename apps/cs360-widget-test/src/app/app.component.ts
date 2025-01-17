import {Component, Inject, OnInit, HostListener} from '@angular/core';
import { Gs360AppLinkService } from '@gs/gdk/directives';
// import { EnvironmentService } from '@gs/gdk/services/environment';

@Component({
  selector: 'gs-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  url;
  cid = "1P02HFQAXVVEGVDPA3NZA4IKN6YMZP56HUDQ";
  /*context: any = {
    cId: '1P02HFQAXVVEGVDPA3LBW0M80H2OVB80HAHS',
    pageContext: 'C360',
    consumptionArea: 'zoom',
    isCompact: true,
    hidePinUpin: true,
    cache: {
      RESOLVE_LAYOUT: true,
      FEATURE_TOGGLE: true
    },
    //Generic platform changes
    entityType: 'company',
    baseObject : 'company',
    uniqueIdentifierFieldName : 'companyId',
    errorType : 'COMPANY_NOT_FOUND',
    uniqueCtxId : 'cId',
    layoutResolveType: 'cid',
    typeId : null,
    sharingType: 'internal',
    layoutResolvePrependUrl: '',
    sectionPrependUrl: '',
    previewConfig: {
      previewPath: 'customersuccess360',
      previewKey: 'cid',
      previewTypeId: null,
      previewBannerTitle: '360.admin.app_comp.c360AppTitle'
    },
  }*/

  constructor(
    private appLinkService: Gs360AppLinkService
  ) {
    window.GS.global360Props = {
      isC360Accessible: true,
      isMiniEnabled: true,
      isR360Accessible: true
    }
  }

  ngOnInit() {
    // this.url = `${this.env.getGS().autonomousUrls['cs360-widget']}/main-es2015.js`;
    // this.url = `https://devstaticjs.develgs.com/cs360-widget/wc_13806/main-es2015.js`;
    //  this.url = 'http://localhost:5500/main-es2015.js';
    this.url = 'https://localhost:4200/main.js';

  }
  @HostListener('window:INIT_MINI_360', ['$event.detail'])
  launchMini360(data : any) {
    this.appLinkService.openMini360(data);
  }

  gotoR360() {

    /*if(this.context.pageContext === 'R360') {
      this.context = {
        ...this.context,
        cId: '1P02P0NGOC3DU7FET47JMKDFVRFVOQDBDPZR',
        pageContext: 'C360',
        consumptionArea: 'zoom'
      }
    } else {
      this.context = {
        ...this.context,
        rId: '1P05JRDG142CCC10BJN2W10NUPKTGGWU1TL7',
        pageContext: 'R360',
        consumptionArea: 'zoom',
        //Generic platform changes
        entityType: 'relationship',
        baseObject : 'relationship',
        uniqueIdentifierFieldName : 'relationshipId',
        errorType : 'RELATIONSHIP_NOT_FOUND',
        uniqueCtxId : 'rId',
        layoutResolveType: 'cid',
        typeId : 'relationshipTypeId',
        sharingType: 'internal',
        layoutResolvePrependUrl: '',
        sectionPrependUrl: '',
        previewConfig: {
          previewPath: 'Relationship360',
          previewKey: 'rid',
          previewTypeId: 'typeId',
          previewBannerTitle: '360.admin.app_comp.r360appTitle'
        }
      }
    }*/
  }
}
