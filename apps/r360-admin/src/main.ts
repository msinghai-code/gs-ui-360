import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ADMIN_CONTEXT_INFO, CONTEXT_INFO, IADMIN_CONTEXT_INFO, PageContext, WidgetCategoryType, WidgetItemSubType, LayoutSharingType } from '@gs/cs360-lib/src/common';
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
    pageContext: PageContext.R360,
    associatedContext: PageContext.R360,
    cdnPath: 'r360-admin',
    // groupByTypeId: null,
    contextType: 'relationshipTypes',
    contextTypeId: 'relationshipTypeId',
    layoutTabName: 'r360Tab',
    objectName: 'relationships',
    baseObject: 'relationship',
    entityContext: 'rId',
    isPartnerUsecaseSupported: true,
    sharingType: LayoutSharingType.INTERNAL,
    previewConfig: {
      previewPath: 'Relationship360',
      previewKey: 'rId',
      previewTypeId: 'typeId',
      previewBannerTitle: '360.admin.app_comp.r360appTitle'
    },
    subTitle: '360.admin.layout_listing.r360subTitle',
    translatedBaseObjectLabel: '360.csm.objectLabels_relationship',
    manageAssignmentConfig: {
      showManageAssignment: true,
      lookupFields: []
    },
    layoutAssignConfig: {
      objectList: [{
        objectLabel: '360.csm.objectLabels_relationship',
        objectName: 'relationship',
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
      sortBy: 'relationshipTypeName',
      groupByType: {type: 'relationshipTypes', typeId: 'relationshipTypeId'},
      labelForTranslation: '360.csm.objectNames_relationship',
      extraColInfo: {
        config:{
          field: 'relationshipTypeName',
          headerName: 'relTypeId',
          minWidth: 250,
          dataType: 'string',
          rowGroup: true,
          hide: true,
          keyCreator: params => params && params.data && params.data.relationshipTypeName
        },
        alternateHeaderName: 'Relationship Type Id'
      }
    },
    layoutConfigurationTabs: [
      {
        label: '360.admin.configuration.prebuilt',
        link: 'common',
        id: 0
      },
      {
        label: '360.admin.configuration.objAssociations',
        link: 'associations',
        id: 1
      }
    ],
    standardWidgetConfig: {
      // report: {
      //   configurable: false
      // },
      // text: {
      //   fieldName: "Comments"
      // }
      [WidgetCategoryType.REPORT]: {
        configurable: false
      },
      [WidgetItemSubType.REPORT]: {
        configurable: false
      },
      [WidgetItemSubType.TEXT]: {
        fieldName: "Comments"
      }
    }
  };
}

function initApp(contextInfo) {
  platformBrowserDynamic([{
    provide: ADMIN_CONTEXT_INFO,
    useValue: contextInfo
  },
  { provide: CONTEXT_INFO, useValue: {} }
  ]).bootstrapModule(AppModule, { ngZone: (window as any).ngZone })
    .catch(err => console.error(err));
}


