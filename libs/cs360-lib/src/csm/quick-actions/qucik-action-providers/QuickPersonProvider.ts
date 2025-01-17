import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { QuickPersonComponent } from '../sections/quick-person/quick-person.component';

// @dynamic
export class QuickActionsPersonProvider extends AbstractSectionProvider {
    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(QuickPersonComponent));
    }
}
