import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmSummaryComponent } from '../modules/csm-summary/csm-summary.component';

// @dynamic
export class SummarySectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmSummaryComponent));
    }

}
