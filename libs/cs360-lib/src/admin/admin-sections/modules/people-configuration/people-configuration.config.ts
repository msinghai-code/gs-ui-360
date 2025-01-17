import { PageContext } from "@gs/cs360-lib/src/common";

export const peopleConfig = {
    [PageContext.C360]: {
        addMapViewNav: true
    },
    [PageContext.R360]: {
        addMapViewNav: false
    },
    [PageContext.P360]: {
        addMapViewNav: false
    },
    [PageContext.SPACES]: {
        addMapViewNav: false 
    }
}