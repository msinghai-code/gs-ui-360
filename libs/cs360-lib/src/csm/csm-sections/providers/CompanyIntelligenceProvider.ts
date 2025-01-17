import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmCompanyIntelligenceComponent } from '../modules/csm-company-intelligence/csm-company-intelligence.component';

// @dynamic
export class CompanyIntelligenceProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmCompanyIntelligenceComponent));
    }

}