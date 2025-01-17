import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { EmbedPageConfigurationComponent } from '../modules/embed-page-configuration/embed-page-configuration.component';

// @dynamic
export class AdminEmbedPageSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(EmbedPageConfigurationComponent));
    }

}
