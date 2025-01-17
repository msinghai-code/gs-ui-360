import { GALAXY_ROUTE, GALAXY_ROUTE_V1 } from '@gs/cs360-lib/src/common';

export const API_URLS = {
  LAYOUT_LISTING: {
    GET_ALL_LAYOUTS: (sharingType: string, entityType: string) => `${GALAXY_ROUTE}/layout/${sharingType}/${entityType}`,
    SAVE_LAYOUT: (layoutId: string) => `${GALAXY_ROUTE}/layout/update/${layoutId}`,
    DELETE_LAYOUT: (sharingType: string, entityType: string, layoutId: string) => `${API_URLS.LAYOUT_LISTING.GET_ALL_LAYOUTS(sharingType, entityType)}/${layoutId}`,
    MARK_AS_DEFUALT: (sharingType: string, entityType: string, layoutId) => `${GALAXY_ROUTE}/layout/makeAsDefault/${sharingType}/${entityType}/${layoutId}`,
    CLONE_LAYOUT: (layoutId: string = '') => `${GALAXY_ROUTE}/layout/clone/${layoutId}`,
    SAVE_LAYOUT_ORDER:  `${GALAXY_ROUTE}/layout/saveOrder`,
    ADD_LAYOUT: `${GALAXY_ROUTE}/layout/save`,
    UPDATE_LAYOUT: (layoutId: string) =>  `${GALAXY_ROUTE}/layout/update/${layoutId}`,
    RENAME_LAYOUT: (layoutId: string) =>  `${GALAXY_ROUTE}/layout/updateBasicDetails/${layoutId}`,
    MANAGE_ASSIGNMENT: (sharingType: string, entityType: string) => `${GALAXY_ROUTE}/layout/manage/${sharingType}/${entityType}`,
    ADD_SECTION: `${GALAXY_ROUTE}/sections/save`,
    UPDATE_SECTION: (sectionId: string) =>  `${GALAXY_ROUTE}/sections/update/${sectionId}`,
    DELETE_SECTION: (sectionId: string) => `${GALAXY_ROUTE}/sections/${sectionId}`,
    CLONE_SECTION: `${GALAXY_ROUTE}/sections/clone`,
    GET_MINI360_ENABLED: `${GALAXY_ROUTE_V1}/admin/config/mini360Enabled`,
    UPDATE_MINI360_ENABLED: `${GALAXY_ROUTE_V1}/admin/config/update/mini360Flag`
  },
  OBJECT_ASSOCIATIONS: {
    GET_OBJECT_ASSOCIATIONS: `${GALAXY_ROUTE}/relationship/association`,
    DELETE_ASSOCIATION: (assocId) => `${GALAXY_ROUTE}/relationship/association/${assocId}`, 
  },
  COMMON_SECTIONS: {
    GET_COMMON_SECTIONS : (entityType: string) => `${GALAXY_ROUTE}/sections/${entityType}`
  },
  RELATIONSHIP_SECTION_CONFIG: {
    GET_CONFIG_LIST: `${GALAXY_ROUTE}/relationship/view/config`,
    GET_STANDARD_SUMMARY_RIBBON_CONFIG: `${GALAXY_ROUTE}/bootstrap/summaryRibbon/config`,
    GET_RELATIONSHIP_TYPES: (configId: string) => configId ? `${GALAXY_ROUTE}/relationship/view/type/${configId}`: `${GALAXY_ROUTE}/relationship/view/type`,
    GET_CONFIG: (configId?: string) => `${GALAXY_ROUTE}/relationship/view/config/byViewId/${configId}`,
    SAVE_CONFIG: (configId?: string) => `${GALAXY_ROUTE}/relationship/view/config`,
    DELETE_CONFIG: (configId: string) => `${GALAXY_ROUTE}/relationship/view/config/${configId}`
  },
  LAYOUT_SECTIONS: {
    DETACH_SECTION: (layoutId: string, sectionId: string) => `${GALAXY_ROUTE}/layout/section/decouple/${layoutId}/${sectionId}`,
    GET_LAYOUT_SECTIONS: (layoutId: string) => `${GALAXY_ROUTE}/layout/${layoutId}`,
    ADD_LAYOUT_SECTION: (layoutId: string) => `${GALAXY_ROUTE}/layout/section/${layoutId}`
  },
  LAYOUT_ASSIGN: {
    ASSIGNMENT_PREVIEW: `${GALAXY_ROUTE}/assignment/preview`,
    GET_LAYOUT_ASSIGNMENT: (layoutId: string) => `${GALAXY_ROUTE}/assignment/${layoutId}`,
    UPDATE_LAYOUT_ASSIGNMENT: `${GALAXY_ROUTE}/assignment`
  }, 
  UTILS: {
    LOOKUP_SEARCH: "v1/api/describe/lookupsearch",
    ADVANCE_LOOKUPSEARCH : "v1/api/describe/advancedlookupsearch"
  },
  FEATURE_FLAGS:{
    P360: 'v1/peoplemgmt/v1.0/standardobjects/people/enableP360'
  }
}
