import { AbstractSectionProvider } from '@gs/cs360-lib/src/common'; 
import { CsmCustomerGoalsComponent } from '../modules/csm-customer-goals/csm-customer-goals.component';

// @dynamic
export class CustomerGoalsSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmCustomerGoalsComponent));
    }

}
