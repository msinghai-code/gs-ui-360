import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { AdminAttributeSectionProvider } from "./providers/AdminAttributeSectionProvider";
import { AdminCompanyHierarchySectionProvider } from "./providers/AdminCompanyHierarchySectionProvider";
import { AdminEmbedPageSectionProvider } from "./providers/AdminEmbedPageSectionProvider";
import { AdminRelationshipSectionProvider } from "./providers/AdminRelationshipSectionProvider";
import { AdminReportSectionProvider } from "./providers/AdminReportSectionProvider";
import { AdminSummarySectionProvider } from "./providers/AdminSummarySectionProvider";
import { AdminUsageSectionProvider } from "./providers/AdminUsageSectionProvider";
import {AdminPeopleSectionProvider} from "./providers/AdminPeopleSectionProvider";

export namespace AdminSectionProviderRegistry {
  const registeredSectionProviders = {
    USAGE: AdminUsageSectionProvider,
    SUMMARY: AdminSummarySectionProvider,
    ATTRIBUTE: AdminAttributeSectionProvider,
    REPORT: AdminReportSectionProvider,
    RELATED_LIST: AdminReportSectionProvider,
    RELATIONSHIP : AdminRelationshipSectionProvider,
    COMPANY_HIERARCHY: AdminCompanyHierarchySectionProvider,
    EMBED_PAGE: AdminEmbedPageSectionProvider,
    PERSON: AdminPeopleSectionProvider
  }
  export function getSectionProvider(sectionType: string): AbstractSectionProvider {
    return registeredSectionProviders[sectionType.toUpperCase()];
  }
}
