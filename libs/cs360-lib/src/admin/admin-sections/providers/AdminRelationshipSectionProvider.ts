import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { RelationshipConfigurationComponent } from '../modules/relationship-configuration/relationship-configuration.component';

// @dynamic
export class AdminRelationshipSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(RelationshipConfigurationComponent));
    }

}
