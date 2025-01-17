import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { CsmReportsComponent } from '../modules/csm-reports/csm-reports.component';

// @dynamic
export class ReportSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmReportsComponent));
    }

}
