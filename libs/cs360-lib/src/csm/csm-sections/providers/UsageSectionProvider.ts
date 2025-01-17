import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmUsageComponent } from '../modules/csm-usage/csm-usage.component';

// @dynamic
export class UsageSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmUsageComponent));
    }

}
