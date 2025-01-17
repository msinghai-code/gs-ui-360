export enum LayoutSectionScope {
    GLOBAL = "GLOBAL",
    LOCAL = "LOCAL"
}

export enum LayoutStatus {
    ASSIGNED = "ASSIGNED",
    UNASSIGNED = "UNASSIGNED",
    DRAFT = "DRAFT",
    DEFAULT = "DEFAULT"
}

// export enum LayoutSharingType {
//     INTERNAL = "internal",
//     EXTERNAL = "external"
// } // moved to c360.defaults

export enum LayoutSteps {
    DETAILS = "details",
    CONFIGURE = "configure",
    ASSIGN = "assign"
}
// {360.admin.layout_upsert_constants.DETAILS}=Basic Details
// {360.admin.layout_upsert_constants.CONFIGURE}=Configure Sections
// {360.admin.layout_upsert_constants.ASSIGN}=Assign
export enum LayoutStepsLabels {
    DETAILS = "360.admin.layout_upsert_constants.DETAILS",
    CONFIGURE = "360.admin.layout_upsert_constants.CONFIGURE",
    ASSIGN = "360.admin.layout_upsert_constants.ASSIGN"
}

export enum LayoutStepsToIndexMap {
    DETAILS = 0,
    CONFIGURE = 1,
    ASSIGN = 2
}
// {360.admin.LAYOUT_UPSERT_MESSAGES.INVALID_CONDITION}=Invalid assignment condition. Check again.
// {360.admin.LAYOUT_UPSERT_MESSAGES.LAYOUT_UPDATE_SUCCESS}=The layout has been updated successfully.
// {360.admin.LAYOUT_UPSERT_MESSAGES.LAYOUT_CREATED_SUCCESS}=The layout has been saved successfully.
export const LAYOUT_UPSERT_MESSAGES = {
    INVALID_CONDITION: "360.admin.LAYOUT_UPSERT_MESSAGES.INVALID_CONDITION",
    LAYOUT_UPDATE_SUCCESS: "360.admin.LAYOUT_UPSERT_MESSAGES.LAYOUT_UPDATE_SUCCESS",
    LAYOUT_CREATED_SUCCESS:"360.admin.LAYOUT_UPSERT_MESSAGES.LAYOUT_CREATED_SUCCESS"
}
