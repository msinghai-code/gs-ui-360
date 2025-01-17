import { OriginalContractDateSettingsComponent } from "../modules/original-contract-date-widget/original-contract-date-settings/original-contract-date-settings.component";
import { AbstractWidgetProvider } from "@gs/cs360-lib/src/csm";

export class OriginalContractDateSettingProvider extends AbstractWidgetProvider {
    public static getWidgetView() {
        return OriginalContractDateSettingsComponent
    }
}