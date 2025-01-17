import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmEmbedPageComponent } from '../modules/csm-embed-page/csm-embed-page.component';

// @dynamic
export class EmbedPageSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmEmbedPageComponent));
    }

}
