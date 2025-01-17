import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import {CsmProductRequestsComponent} from "../modules/csm-product-requests/csm-product-requests.component";

// @dynamic
export class ProductRequestsProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmProductRequestsComponent));
    }
}
