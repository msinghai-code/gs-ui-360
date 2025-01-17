import { DefaultWidgetSettingProvider } from "./providers/DefaultWidgetProvider";
import { AttributeWidgetSettingProvider, FieldWidgetSettingProvider } from "./providers/AttributeWidgetProvider";
import { TextWidgetSettingProvider } from "./providers/TextWidgetProvider";
import { ImageWidgetSettingProvider } from "./providers/ImageWidgetProvider";
import { WidgetItemSubType, AbstractWidgetProvider } from '@gs/cs360-lib/src/common';
import { ReportWidgetSettingsProvider } from "./providers/ReportWidgetProvider";
import { CockpitWidgetSettingProvider } from "./providers/CockpitWidgetProvider";
import { HealthScoreWidgetSettingProvider } from "./providers/HealthScoreWidgetProvider";
import { CustomerJourneySettingProvider } from "./providers/CustomerJourneyWidgetProvider";
import { OriginalContractDateSettingProvider } from "./providers/OriginalContractDateSettingProvider";


export namespace WidgetSettingProviderRegistry {
    const registeredWidgetSettingProviders = {
        [WidgetItemSubType.DEFAULT]: DefaultWidgetSettingProvider,
        [WidgetItemSubType.ATTRIBUTE]: AttributeWidgetSettingProvider,
        [WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE]: AttributeWidgetSettingProvider,
        [WidgetItemSubType.CSM]: FieldWidgetSettingProvider,
        [WidgetItemSubType.TEXT]: TextWidgetSettingProvider,
        [WidgetItemSubType.IMAGE]: ImageWidgetSettingProvider,
        [WidgetItemSubType.REPORT]: ReportWidgetSettingsProvider,
        [WidgetItemSubType.FIELD]: FieldWidgetSettingProvider,
        [WidgetItemSubType.CASE]: CockpitWidgetSettingProvider,
        [WidgetItemSubType.COCKPIT_CTA]: CockpitWidgetSettingProvider,
        [WidgetItemSubType.HEALTH_SCORE_METRIC_AND_HISTORY]: HealthScoreWidgetSettingProvider,
        [WidgetItemSubType.HEALTH_SCORE_METRIC]: HealthScoreWidgetSettingProvider,
        [WidgetItemSubType.CUSTOMER_JOURNEY]: CustomerJourneySettingProvider,
        [WidgetItemSubType.ORIGINAL_CONTRACT_DATE]: OriginalContractDateSettingProvider
    };

    export function getWidgetSettingProvider(widgetSubType: WidgetItemSubType): AbstractWidgetProvider {
        return registeredWidgetSettingProviders[widgetSubType] ? registeredWidgetSettingProviders[widgetSubType] : registeredWidgetSettingProviders[WidgetItemSubType.DEFAULT];
    }
}
