import { AbstractSectionProvider } from '@gs/cs360-lib/src/common'; 
import { CsmCockpitComponent } from '../modules/csm-cockpit/csm-cockpit.component';

// @dynamic
export class CockpitSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmCockpitComponent));
    }

}
