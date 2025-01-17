import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import {QuickEnhancementRequestComponent} from "../sections/quick-enhancement-request/quick-enhancement-request.component";

// @dynamic
export class QuickActionsERProvider extends AbstractSectionProvider {
    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(QuickEnhancementRequestComponent));
    }
}
