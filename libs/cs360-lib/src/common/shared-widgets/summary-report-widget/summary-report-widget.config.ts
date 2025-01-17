import { PageContext } from "../../cs360.constants";

export const summaryReportWidgetConfig = {
    [PageContext.C360]: {
        configurable: true
    },
    [PageContext.R360]: {
        configurable: false
    },
    [PageContext.P360]: {
        configurable: true
    },
    [PageContext.SPACES]: {
        configurable: true 
    }
}