import { EmptyComponent } from '../modules/empty/empty.component';

import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';

// @dynamic
export class EmptySectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(EmptyComponent));
    }

}
