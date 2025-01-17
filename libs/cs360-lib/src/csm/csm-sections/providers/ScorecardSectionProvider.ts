import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmScorecardComponent } from '../modules/csm-scorecard/csm-scorecard.component';

// @dynamic
export class ScorecardSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmScorecardComponent));
    }

}