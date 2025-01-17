import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmAttributeComponent } from '../modules/csm-attribute/csm-attribute.component';

// @dynamic
export class AttributeSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmAttributeComponent));
    }

}
