export const PX_CONSTANTS = {
    NOTIFICATION_SUBSCRIBER: (areaName) => `${areaName}-follow-btn gs-notification-subscriber-button`,
    TABS_DROPDOWN: (areaName) => `${areaName}-personalize-section`,
    SHARE_SS_DROPDOWN: (areaName) => {
        return {
            SS_EXPORTS: `${areaName}-ss-exports`,
            SHARE_360: `${areaName}-share-impressions`
        }
    }
}


export const PX_CUSTOM_EVENTS = {
    DATA_EDIT: '360_Data_Edit',
    WIDGET_REDIRECTION: '360_Widget_Redirection',
    PAGE_VISITS: (areaName) =>`${areaName}_PAGE_VISIT`
}

export enum WidgetTypes {
    FIELD_WIDGET= 'field_widget',
    ATTRIBUTE_SECTION = 'attribute_section',
    ATTRIBUTE_WIDGET = 'attribute_widget',
    RICHTEXTAREA = 'RICHTEXTAREA',
    RICHTEXTAREA_EDIT = 'rta_edit'
}
