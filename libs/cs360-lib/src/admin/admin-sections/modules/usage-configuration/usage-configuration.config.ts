import { PageContext } from "@gs/cs360-lib/src/common";

export const usageConfig = {
    [PageContext.C360]: {
        filterProjects: false,
        filterDashboards: false
    },
    [PageContext.R360]: {
        filterProjects: true,
        filterDashboards: true
    },
    [PageContext.P360]: {
        filterProjects: false,
        filterDashboards: false
    },
    [PageContext.SPACES]: {
        filterProjects: false,
        filterDashboards: false
    }
}