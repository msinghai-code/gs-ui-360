import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { PeopleConfigurationComponent } from "../modules/people-configuration/people-configuration.component";

// @dynamic
export class AdminPeopleSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(PeopleConfigurationComponent));
    }

}
