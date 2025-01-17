import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CompanyHierarchyConfigurationComponent } from '../modules/company-hierarchy-configuration/company-hierarchy-configuration.component';

// @dynamic
export class AdminCompanyHierarchySectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CompanyHierarchyConfigurationComponent));
    }

}
