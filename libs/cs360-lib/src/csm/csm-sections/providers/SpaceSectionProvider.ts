import { AbstractSectionProvider } from '@gs/cs360-lib/src/common'; 
import { CsmSpaceComponent } from '../modules/csm-space/csm-space.component';

// @dynamic
export class SpaceSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmSpaceComponent));
    }

}
