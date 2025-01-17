
import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CompanyHierarchySectionService } from "./services/preload/CompanyHierarchySectionService";
import { SummarySectionService } from "./services/preload/SummarySectionService";
import { EmptySectionProvider } from "./providers/EmptySectionProvider";
import { CompanyIntelligenceProvider } from "./providers/CompanyIntelligenceProvider";
import { EmbedPageSectionProvider } from "./providers/EmbedPageSectionProvider";
import { UsageSectionProvider } from "./providers/UsageSectionProvider";
import {RcForecastSectionProvider} from "./providers/RcForecastSectionProvider";
import { CustomerGoalsSectionProvider } from "./providers/CustomerGoalsSectionProvider";
import {LeadsSectionProvider} from "./providers/LeadsSectionProvider";
import {ProductRequestsProvider} from "./providers/ProductRequestsProvider";
import { SpaceSectionProvider } from "./providers/SpaceSectionProvider";

export namespace CSMSectionProviderRegistry {
    const registeredSectionProviders = {
        USAGE: 'usage',
        SUMMARY: 'summary',
        ATTRIBUTE: 'attribute',
        RELATIONSHIP : 'relationship',
        RELATED_LIST: 'relatedlist',
        COMPANY_HIERARCHY: 'companyhierarchy',
        SURVEY: 'survey',
        PERSON: 'person',
        COMPANY_INTELLIGENCE: 'companyintelligence',
        COCKPIT : 'cockpit',
        EMBED_PAGE: 'embedpage',
        TIMELINE: 'timeline',
        SUCCESS_PLAN: 'successplan',
        SCORECARD: 'scorecard',
        FORECAST: 'forecast',
        CUSTOMER_GOALS: 'customergoals',
        LEADS: 'leads',
        PRODUCT_REQUESTS: 'productrequests',
        SPACES: 'spaces'
    }
    export function getSectionProvider(sectionType: string): AbstractSectionProvider {
        return registeredSectionProviders[sectionType.toUpperCase()];
    }
    export function getEmptySectionProvider() {
        return EmptySectionProvider;
    }
}

export namespace SectionServiceRegistry {
    const registeredSectionServices = {
        SUMMARY: SummarySectionService,
        ATTRIBUTE: CompanyHierarchySectionService,
    }

    export function getAllRegisteredServices(): any {
        return registeredSectionServices;
    }

    export function getSectionProvider(sectionType: string): any {
        return registeredSectionServices[sectionType.toUpperCase()];
    }
}
