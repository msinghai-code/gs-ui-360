import { PageContext } from '@gs/cs360-lib/src/common';
import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { ReportConfigWrapperComponent } from "../modules/reports-configuration/report-config-wrapper/report-config-wrapper.component";
import { R360ReportConfigWrapperComponent } from "../modules/reports-configuration/r360-report-config-wrapper/r360-report-config-wrapper.component";

// @dynamic
export class AdminReportSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView(type: string, context: any) {
        const { pageContext, associatedContext, relationshipTypeId } = context;
        const contextToConsider = associatedContext || pageContext;
        switch (contextToConsider) {
            case PageContext.C360:
                return new Promise(resolve => resolve(ReportConfigWrapperComponent));
            case PageContext.R360:
                if(!!relationshipTypeId) {
                    return new Promise(resolve => resolve(R360ReportConfigWrapperComponent));
                } else {
                    return new Promise(resolve => resolve(ReportConfigWrapperComponent));
                }
            default: return new Promise(resolve => resolve(ReportConfigWrapperComponent));
        }
    }

}
