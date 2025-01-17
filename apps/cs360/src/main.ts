import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { LayoutSharingType, PageContext } from '@gs/cs360-lib/src/common';

import { AppModule } from './app/app.module';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { environment } from './environments/environment';
import {LicenseManager} from "@ag-grid-enterprise/core";

window['GS'].convertCurrencyISOCodeToPicklist = true;

if (environment.production) {
  enableProdMode();
}

initApp({
  ...getPageContext()
});

LicenseManager.setLicenseKey(atob((environment as any).NG_APP_AG_GRID_KEY));

function paramsToObject(entries) {
  const result = {}
  for(const [key, value] of entries) { // each 'entry' is a [key, value] tupple
    result[key.toUpperCase()] = value;
  }
  return result;
}


function getPageContext() {
  const searchParams = new URLSearchParams(window.location.search) as any;
  const entries = searchParams.entries();
  const params = paramsToObject(entries);
  let result:any = {};
  if(params["CID"] || params["AID"] || params["DID"] || location.pathname.includes('customersuccess360')) {
    result = {
      cId : params["CID"] || null,
      aId : params["AID"],
      dId : params["DID"],
      pageContext : PageContext.C360,
      entityId : params["CID"],
      entityType: 'company',
      isp: params["ISP"] === 'true',
      //generic platform context
      baseObject : 'company',
      uniqueIdentifierFieldName : 'companyId',
      errorType : 'COMPANY_NOT_FOUND',
      uniqueCtxId : 'cId',
      layoutResolveType: 'cid',
      entityContext: 'cId',
      typeId : null,
      sharingType: LayoutSharingType.INTERNAL,
      layoutResolvePrependUrl: '',
      sectionPrependUrl: '',
      previewConfig: {
        previewPath: 'customersuccess360',
        previewKey: 'cId',
        previewTypeId: null,
        previewBannerTitle: '360.admin.app_comp.c360AppTitle'
      },
    }
  }

  if(params["RID"] || location.pathname.includes('relationship360')) {
    result = {
      rId : params["RID"] || null,
      entityId : params["RID"],
      entityType: 'relationship',
      pageContext : PageContext.R360,
      isp: params["ISP"] === 'true',
      baseObject : 'relationship',
      uniqueIdentifierFieldName : 'relationshipId',
      errorType : 'RELATIONSHIP_NOT_FOUND',
      uniqueCtxId : 'rId',
      layoutResolveType: 'cid',
      typeId : 'relationshipTypeId',
      sharingType: LayoutSharingType.INTERNAL,
      layoutResolvePrependUrl: '',
      sectionPrependUrl: '',
      previewConfig: {
        previewPath: 'Relationship360',
        previewKey: 'rId',
        previewTypeId: 'typeId',
        previewBannerTitle: '360.admin.app_comp.r360appTitle'
      },
    }
  }

  if(params["ISNATIVEWIDGET"]) {
    result = {
      ...result,
      isNativeWidget : params["ISNATIVEWIDGET"]
    }
  }

  if(params["SECTIONNAME"] || params["SECTIONLABEL"]) {
    result = {
      ...result,
      sectionName : params["SECTIONNAME"],
      sectionLabel : params["SECTIONLABEL"]
    }
  }

  if(params["SHOWTIMELINE"]) {
    result["hideTimeline"] = params["SHOWTIMELINE"] === "false"
  }

  if(params["SHOWDETAILVIEW"]) {
    result["hideDetailView"] = params["SHOWDETAILVIEW"] === "false"
  }

  if(params["SHOWSALLY"]) {
    result["hideSally"] = params["SHOWSALLY"] === "false"
  }
  /*if(!result.cId && !result.rId && !result.aId && !result.dId) {
    result.error  = "The company/relationship you are trying to look for doesn't exists.";
    result.errorType = 'COMPANY_OR_RELATIONSHIP_NOT_FOUND';
  }*/

  return result;

}

function initApp(contextInfo) {
  platformBrowserDynamic([{
    provide : CONTEXT_INFO,
    useValue :  contextInfo
  }]).bootstrapModule(AppModule, { ngZone: (window as any).ngZone })
  .catch(err => console.error(err));
}


