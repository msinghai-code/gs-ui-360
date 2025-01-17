import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmPeopleComponent } from "../modules/csm-people/csm-people.component";

// @dynamic
export class PeopleProvider extends AbstractSectionProvider {
    
    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmPeopleComponent));
    }

}
