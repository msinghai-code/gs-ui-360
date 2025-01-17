import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { QuickTimelineComponent } from '../sections/quick-timeline/quick-timeline.component';

// @dynamic
export class QuickTimelineProvider extends AbstractSectionProvider {
    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(QuickTimelineComponent));
    }
}
