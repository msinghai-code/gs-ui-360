import { LazyWidgetEntry } from "@gs/gdk/services/lazy";

export const lazyWidgets: LazyWidgetEntry[] = [
    {
        path: 'timeline',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-timeline/csm-timeline.module').then(m => m.CsmTimelineModule)
    },
    {
        path: 'survey',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-survey/csm-survey.module').then(m => m.CsmSurveyModule)
    },
    {
        path: 'person',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-people/csm-people.module').then(m => m.CsmPeopleModule)
    },
    {
        path: 'cockpit',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-cockpit/csm-cockpit.module').then(m => m.CsmCockpitModule)
    },
    {
        path: 'successplan',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-successplan/csm-successplan.module').then(m => m.CsmSuccessplanModule)
    },
    {
        path: 'scorecard',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-scorecard/csm-scorecard.module').then(m => m.CsmScorecardModule)
    },
    {
        path: 'summary',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-summary/csm-summary.module').then(m => m.CsmSummaryModule)
    },
    {
        path: 'attribute',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-attribute/csm-attribute.module').then(m => m.CsmAttributeModule)
    },
    {
        path: 'relatedlist',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-reports/csm-reports.module').then(m => m.CsmReportsModule)
    },
    {
        path: 'relationship',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-relationship/csm-relationship.module').then(m => m.CsmRelationshipModule)
    },
    {
        path: 'usage',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-usage/csm-usage.module').then(m => m.CsmUsageModule)
    },
    {
        path: 'companyintelligence',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-company-intelligence/csm-company-intelligence.module').then(m => m.CsmCompanyIntelligenceModule)
    },
    {
        path: 'forecast',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-rc-forecast/csm-rc-forecast.module').then(m => m.CsmRcForecastModule)
    },
    {
        path: 'customergoals',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-customer-goals/csm-customer-goals.module').then(m => m.CsmCustomerGoalsModule)
    },
    {
        path: 'leads',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-leads/csm-leads.module').then(m => m.CsmLeadsModule)
    },
    {
        path: 'productrequests',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-product-requests/csm-product-requests.module').then(m => m.CsmProductRequestsModule)
    },
    {
        path: 'embedpage',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-embed-page/csm-embed-page.module').then(m => m.CsmEmbedPageModule)
    },
    {
        path: 'companyhierarchy',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-company-hierarchy/csm-company-hierarchy.module').then(m => m.CsmCompanyHierarchyModule)
    },
    {
        path: 'spaces',
        loadChildren: () => import('@gs/cs360-lib/src/csm/csm-sections/modules/csm-space/csm-space.module').then(m => m.CsmSpaceModule)
    }
];
