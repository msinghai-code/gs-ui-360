import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { QuickCTAProvider } from "./qucik-action-providers/QuickCTAProvider";
import { QuickActionsPersonProvider } from "./qucik-action-providers/QuickPersonProvider";
import { QuickTimelineProvider } from "./qucik-action-providers/QuickTimelineProvider";
import {QuickActionsLeadProvider} from "./qucik-action-providers/QuickLeadProvider";
import {QuickActionsERProvider} from "./qucik-action-providers/QuickERProvider";

export namespace QuickActionsSectionProviderRegistry {
    const registeredSectionProviders = {
        PERSON: QuickActionsPersonProvider,
        COCKPIT : QuickCTAProvider,
        TIMELINE: QuickTimelineProvider,
        LEADS: QuickActionsLeadProvider,
        PRODUCT_REQUESTS: QuickActionsERProvider
    }
    export function getSectionProvider(sectionType: string): AbstractSectionProvider {
        return registeredSectionProviders[sectionType.toUpperCase()];
    }
}
