import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmTimelineComponent} from "../modules/csm-timeline/csm-timeline.component";

// @dynamic
export class TimelineProvider extends AbstractSectionProvider {
    
    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmTimelineComponent));
    }

}
