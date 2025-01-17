export const API_VERSION_NUMBER = `v2`;
export const GALAXY_ROUTE = `${API_VERSION_NUMBER}/galaxy`;
export const API_ENDPOINTS = {
  GET_BOOTSTRAP: (entity: string) => `${GALAXY_ROUTE}/bootstrap/consumption/config/${entity}`,
  GET_SECTON: (layoutId: string, sectionId: string) => `${GALAXY_ROUTE}/layout/section/${layoutId}/${sectionId}`,
  SAVE_SECTION: (layoutId: string) => `${GALAXY_ROUTE}/layout/section/${layoutId}`,
  RESOLVE_LAYOUT: (resolveType: string) => `${GALAXY_ROUTE}/assignment/resolve/${resolveType}`,
  GET_FEATURE_CONFIG: `v1/features/evaluate`,
  SAVE_PINNED_ITEMS: `${GALAXY_ROUTE}/cr360/user/config`
};

export const APPLICATION_MESSAGES = {
  PINNED_ITEMS_UPDATED: "360.csm.APPLICATION_MESSAGES.PINNED_ITEMS_UPDATED",
  PINNED_ITEMS_RESET: "360.csm.APPLICATION_MESSAGES.PINNED_ITEMS_RESET",
  PINNED_ITEMS_RESET_ERROR: "360.csm.APPLICATION_MESSAGES.PINNED_ITEMS_RESET_ERROR",
};


export const SUCCESS_SNAPSHOT_EXPORT_MESSAGES = {
  EMAIL_AUTHORIZATION_REVOKE_SUCCESS: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.EMAIL_AUTHORIZATION_REVOKE_SUCCESS",
  EMAIL_AUTHORIZATION_REVOKE_FAIL: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.EMAIL_AUTHORIZATION_REVOKE_FAIL",
  AUTHENTICATION_FAILED: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.AUTHENTICATION_FAILED",
  SUCCESS_SNAPSHOT_EXPORT_SUCCESS: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SUCCESS_SNAPSHOT_EXPORT_SUCCESS",
  SUCCESS_SNAPSHOT_EXPORT_TO_GOOGLE_ACCOUNT_SUCCESS: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SUCCESS_SNAPSHOT_EXPORT_TO_GOOGLE_ACCOUNT_SUCCESS",
  SUCCESS_SNAPSHOT_EXPORT_FAIL: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SUCCESS_SNAPSHOT_EXPORT_FAIL",
  ENTER_ALL_FIELD: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.ENTER_ALL_FIELD",
  SP_ACCESS_REQUIRED: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SP_ACCESS_REQUIRED",
  NO_ACCESS_TO_SP_AND_RELATIONSHIPS_REPORTS: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_AND_RELATIONSHIPS_REPORTS",
  NO_ACCESS_TO_SP_REPORTS: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_REPORTS",
  NO_ACCESS_TO_RELATIONSHIP_REPORTS: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIP_REPORTS",
  NO_ACCESS_TO_RELATIONSHIPS_AS_ENTITY: "360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIPS_AS_ENTITY"
};

