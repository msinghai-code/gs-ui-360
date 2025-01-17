import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ADMIN_CONTEXT_INFO, CONTEXT_INFO, IADMIN_CONTEXT_INFO, PageContext, WidgetCategoryType, WidgetItemSubType, LayoutSharingType, ObjectNames } from '@gs/cs360-lib/src/common';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {LicenseManager} from "@ag-grid-enterprise/core";


if (environment.production) {
  enableProdMode();
}

initApp({
  ...getPageContext()
});

LicenseManager.setLicenseKey(atob((environment as any).NG_APP_AG_GRID_KEY));

function getPageContext(): IADMIN_CONTEXT_INFO {
  return {
    endUserPreview: false,
    pageContext: PageContext.C360,
    associatedContext: PageContext.C360,
    cdnPath: 'cs360-admin',
    contextTypeId: null,
    layoutTabName: 'c360Tab',
    objectName: 'companies',
    baseObject: 'company',
    isPartnerUsecaseSupported: true,
    sharingType: LayoutSharingType.INTERNAL,
    entityContext: 'cId',
    previewConfig: {
      previewPath: 'customersuccess360',
      previewKey: 'cId',
      previewTypeId: null,
      previewBannerTitle: '360.admin.app_comp.c360AppTitle'
    },
    subTitle: '360.admin.layout_listing.c360subTitle',
    translatedBaseObjectLabel: '360.csm.objectLabels_company',
    manageAssignmentConfig: {
      showManageAssignment: true,
      lookupFields: [
        {searchTerm: '', objectName: 'company', forceSearch: true, fields:["Name"]},
        {searchTerm: '', objectName: ObjectNames.USER, forceSearch: true, fields:["Name", "Email"]}
      ]
    },
    layoutAssignConfig: {
      objectList: [{
        objectLabel: '360.csm.objectLabels_company',
        objectName: 'company',
        excludeFields: [],
        nestLevels: 1
      },
      {
        objectLabel: '360.admin.layout_listing.user',
        objectName: "gsuser",
        excludeFields: [],
        nestLevels: 1
      }]
    },
    hidePrebuiltSectionsToConfigure: false,
    standardLayoutConfig: {
      sortBy: 'displayOrder',
      labelForTranslation: '360.csm.objectNames_company',
      groupByType: null,
      extraColInfo: null,
    },
    layoutConfigurationTabs: [
      {
        label: '360.admin.configuration.prebuilt',
        link: 'common',
        id: 0
      },
      {
        label: '360.admin.configuration.relSecViews',
        link: 'relationship',
        id: 1,
        displayIf: 'GS.isRelationshipEnabled'
      }
    ],
    standardWidgetConfig: {
      [WidgetCategoryType.REPORT]: {
        configurable: true
      },
      [WidgetItemSubType.TEXT]: {
        fieldName: "Summary"
      }
    }
  };
}

function initApp(contextInfo) {
  platformBrowserDynamic([
  { provide : ADMIN_CONTEXT_INFO, useValue: contextInfo },
  { provide : CONTEXT_INFO, useValue: {} }
]).bootstrapModule(AppModule, { ngZone: (window as any).ngZone })
  .catch(err => console.error(err));
}


