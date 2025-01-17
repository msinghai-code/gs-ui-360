import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { SummaryConfigurationComponent } from "../modules/summary-configuration/summary-configuration.component";

// @dynamic
export class AdminSummarySectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(SummaryConfigurationComponent));
    }

}
