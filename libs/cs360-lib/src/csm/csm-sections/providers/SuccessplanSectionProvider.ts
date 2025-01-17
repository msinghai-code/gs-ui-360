import { AbstractSectionProvider } from '@gs/cs360-lib/src/common'; 
import { CsmSuccessplanComponent } from '../modules/csm-successplan/csm-successplan.component';

// @dynamic
export class SuccessplanSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmSuccessplanComponent));
    }

}
