import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import {QuickLeadComponent} from "../sections/quick-lead/quick-lead.component";

// @dynamic
export class QuickActionsLeadProvider extends AbstractSectionProvider {
    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(QuickLeadComponent));
    }
}
