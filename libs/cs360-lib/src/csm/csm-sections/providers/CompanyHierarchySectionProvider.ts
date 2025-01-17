import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmCompanyHierarchyComponent } from '../modules/csm-company-hierarchy/csm-company-hierarchy.component';

// @dynamic
export class CompanyHierarchySectionProvider extends AbstractSectionProvider {
    
    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmCompanyHierarchyComponent));
    }

}
