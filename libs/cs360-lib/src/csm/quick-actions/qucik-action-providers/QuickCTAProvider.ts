import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { QuickCtaComponent } from '../sections/quick-cta/quick-cta.component';

// @dynamic
export class QuickCTAProvider extends AbstractSectionProvider {
    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(QuickCtaComponent));
    }
}
