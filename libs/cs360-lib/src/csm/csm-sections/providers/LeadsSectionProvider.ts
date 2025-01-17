import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import {CsmLeadsComponent} from "../modules/csm-leads/csm-leads.component";

// @dynamic
export class LeadsSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmLeadsComponent));
    }
}
