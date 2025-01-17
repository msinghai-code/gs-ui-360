import { CustomerJourneyWidgetProvider } from "./providers/CustomerJourneyWidgetProvider";
import { DefaultWidgetProvider } from "./providers/DefaultWidgetProvider";
import { AttributeWidgetProvider, FieldWidgetProvider } from "./providers/AttributeWidgetProvider";
import { TextWidgetProvider } from "./providers/TextWidgetProvider";
import { ImageWidgetProvider } from "./providers/ImageWidgetProvider";
import { DefaultThreeLevelWidgetProvider } from "./providers/DefaultThreeLevelWidgetProvider";
import { WidgetItemSubType, AbstractWidgetProvider } from '@gs/cs360-lib/src/common';
import { ReportWidgetProvider } from "./providers/ReportWidgetProvider";
import { TimelineSummaryWidgetProvider } from "./providers/TimelineSummaryWidgetProvider";
import { HealthScoreWidgetProvider } from "./providers/HealthScoreWidgetProvider";
import { CustomerHighlightsWidgetProvider } from "./providers/CustomerHighlightsProvider";

export namespace WidgetProviderRegistry {
    const registeredWidgetProviders = {
        [WidgetItemSubType.CUSTOMER_JOURNEY]: CustomerJourneyWidgetProvider,
        [WidgetItemSubType.DEFAULT]: DefaultWidgetProvider,
        [WidgetItemSubType.ATTRIBUTE]: AttributeWidgetProvider,

        [WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE]: AttributeWidgetProvider,
        [WidgetItemSubType.TEXT]: TextWidgetProvider,
        [WidgetItemSubType.IMAGE]: ImageWidgetProvider,
        [WidgetItemSubType.THREE_LEVEL_WIDGET]: DefaultThreeLevelWidgetProvider,
        [WidgetItemSubType.REPORT]: ReportWidgetProvider,
        [WidgetItemSubType.FIELD]: FieldWidgetProvider,
        [WidgetItemSubType.TIMELINE]: TimelineSummaryWidgetProvider,
        [WidgetItemSubType.HEALTH_SCORE_METRIC_AND_HISTORY]: HealthScoreWidgetProvider,
        [WidgetItemSubType.HEALTH_SCORE_METRIC]: HealthScoreWidgetProvider,
        [WidgetItemSubType.CUSTOMER_HIGHLIGHTS]: CustomerHighlightsWidgetProvider
    };

    export function getWidgetProvider(subType: WidgetItemSubType): AbstractWidgetProvider {
        const type = subType;
        return registeredWidgetProviders[type] ? registeredWidgetProviders[type] : registeredWidgetProviders[WidgetItemSubType.DEFAULT];
    }
}
