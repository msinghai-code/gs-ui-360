import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { AttributeConfigurationComponent } from '../modules/attribute-configuration/attribute-configuration.component';

// @dynamic
export class AdminAttributeSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(AttributeConfigurationComponent));
    }

}
