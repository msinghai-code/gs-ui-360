import { PageContext } from "@gs/cs360-lib/src/common";

export const summaryConfig = {
    [PageContext.C360]: {
        invalidateWidgetsForReport: true
    },
    [PageContext.R360]: {
        invalidateWidgetsForReport: false
    },
    [PageContext.P360]: {
        invalidateWidgetsForReport: true
    },
    [PageContext.SPACES]: {
        invalidateWidgetsForReport: false 
    }
}
