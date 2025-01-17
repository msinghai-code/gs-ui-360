import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { UsageConfigurationComponent } from "../modules/usage-configuration/usage-configuration.component";

// @dynamic
export class AdminUsageSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(UsageConfigurationComponent));
    }

}