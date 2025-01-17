import { CustomerJourneyWidgetProvider } from "./providers/CSMCustomerJourneyWidgetProvider";
import { AbstractWidgetProvider } from "./providers/CSMAbstractWidgetProvider";
import { DefaultWidgetProvider } from "./providers/CSMDefaultWidgetProvider";
import { AttributeWidgetProvider } from "./providers/CSMAttributeWidgetProvider";
import { ImageWidgetProvider } from "./providers/CSMImageWidgetProvider";
import { DefaultThreeLevelWidgetProvider } from "./providers/CSMDefaultThreeLevelWidgetProvider";
import { WidgetItemSubType } from '@gs/cs360-lib/src/common';
import { ReportWidgetProvider } from "./providers/CSMReportWidgetProvider";
import { CSMFieldWidgetProvider } from "./providers/CSMFieldWidgetProvide";
import { CSMBasicInsightWidgetProvider } from "./providers/CSMBasicInsightWidgetProvide";
import { CSATWidgetProvider } from "./providers/CSMCSATWigetProvider";
import { NPSWidgetProvider } from "./providers/CSMNPSWidgetProvider";
import { CSMTimelineWidgetProvider } from "./providers/CSMTimelineWidgetProvider";
import { CSMCiWidgetProvider } from './providers/CSMCIWidgetProvider';
import { CSMHealthScoreWidgetProvider } from './providers/CSMHealthScoreWidgetProvider'
import { CSMCustomColumnChartWidgetProvider } from "./providers/CSMCustomColumnChartWidgetProvider";
import {CSMLeadsWidgetProvider} from "./providers/CSMLeadsWidgetProvider";
import { CommunityWidgetProvider } from "./providers/CSMCommunityWidgetProvider";
import { CustomerHighlightsWidgetProvider } from "./providers/CSMCustomerHighlightsWidgetProvider";

export namespace WidgetProviderRegistry {
    const registeredWidgetProviders = {
        [WidgetItemSubType.CUSTOMER_JOURNEY]: CustomerJourneyWidgetProvider,
        [WidgetItemSubType.DEFAULT]: DefaultWidgetProvider,
        [WidgetItemSubType.ATTRIBUTE]: AttributeWidgetProvider,
        [WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE]: AttributeWidgetProvider,
        [WidgetItemSubType.IMAGE]: ImageWidgetProvider,
        [WidgetItemSubType.THREE_LEVEL_WIDGET]: DefaultThreeLevelWidgetProvider,
        [WidgetItemSubType.REPORT]: ReportWidgetProvider,
        [WidgetItemSubType.FIELD]: CSMFieldWidgetProvider,
        [WidgetItemSubType.TEXT]: CSMFieldWidgetProvider,
        [WidgetItemSubType.BASE_INSIGHT_WIDGET]: CSMBasicInsightWidgetProvider,
        [WidgetItemSubType.ASP]: CSMCustomColumnChartWidgetProvider,
        [WidgetItemSubType.COCKPIT]: CSMCustomColumnChartWidgetProvider,
        [WidgetItemSubType.CSAT]: CSATWidgetProvider,
        [WidgetItemSubType.NPS]: NPSWidgetProvider,
        [WidgetItemSubType.TIMELINE]: CSMTimelineWidgetProvider,
        [WidgetItemSubType.COMPANY_INTELLIGENCE]: CSMCiWidgetProvider,
        [WidgetItemSubType.HEALTH_SCORE_METRIC_AND_HISTORY]: CSMHealthScoreWidgetProvider,
        [WidgetItemSubType.HEALTH_SCORE_METRIC]: CSMHealthScoreWidgetProvider,
        [WidgetItemSubType.LEADS]: CSMLeadsWidgetProvider,
        [WidgetItemSubType.COMMUNITY_METRICS]: CommunityWidgetProvider,
        [WidgetItemSubType.CUSTOMER_HIGHLIGHTS]:CustomerHighlightsWidgetProvider


    };

    export function getWidgetProvider(subType: WidgetItemSubType): AbstractWidgetProvider {
        let type = subType;
        if([WidgetItemSubType.ARR, WidgetItemSubType.MRR, WidgetItemSubType.RENEWAL_DATE, WidgetItemSubType.ORIGINAL_CONTRACT_DATE].includes(subType)){
            type = WidgetItemSubType.THREE_LEVEL_WIDGET;
        }
        if([WidgetItemSubType.COCKPIT_CTA, WidgetItemSubType.SP, WidgetItemSubType.CASE].includes(subType)){
            type = WidgetItemSubType.BASE_INSIGHT_WIDGET;
        }
        return registeredWidgetProviders[type] ? registeredWidgetProviders[type] : registeredWidgetProviders[WidgetItemSubType.DEFAULT];
    }
}
