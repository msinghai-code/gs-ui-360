import { API_VERSION_NUMBER } from '@gs/cs360-lib/src/common';

export const API_URLS = {
    GET_ALL_RELATIONSHIP_REPORTS: `v3/bi/reporting-ui/list-all`,
    GET_SECTION_DETAILS: (layoutId: string, sectionId: string) => `${API_VERSION_NUMBER}/galaxy/layout/section/${layoutId}/${sectionId}`,
}

export const DEFAULT_SOURCEDETAILS_FOR_RELATIONSHIP = {
    connectionType: 'MDA',
    connectionId: 'MDA',
    objectName: 'relationship'
}
export const RELATIONSHIP_SETTINGS_CONFIG =(i18nService?)=>{
    return [
    { label: '360.admin.RELATIONSHIP_SETTINGS_CONFIG.label_one', value: 'ALLOW_RELATIONSHIP_CREATE_DELETE', checked: false, disabled: false },
    { label: '360.admin.RELATIONSHIP_SETTINGS_CONFIG.label_two', value: 'ALLOW_RELATIONSHIP_EDIT', checked: true, disabled: false }
]};
