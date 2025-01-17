import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmRelationshipComponent } from '../modules/csm-relationship/csm-relationship.component';

// @dynamic
export class RelationshipSectionProvider extends AbstractSectionProvider {
    
    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmRelationshipComponent));
    }

}
