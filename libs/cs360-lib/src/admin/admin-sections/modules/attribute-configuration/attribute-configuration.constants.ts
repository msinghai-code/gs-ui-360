import { CustomizedField } from '@gs/cs360-lib/src/common';

export interface AttributeGroup {
    groupId: string;
    showLabelInput: boolean;
    label: string;
    tempLabel?: string;
    columns: CustomizedField[];
}
//{360.admin.AttributeMessages.FIELD_EXISTS}=This attribute is already added
//{360.admin.AttributeMessages.FIELD_LIMIT_REACHED}=Maximum limit for attributes reached
//{360.admin.AttributeMessages.GROUP_LIMIT_REACHED}=Maximum limit for groups reached
//{360.admin.AttributeMessages.GROUP_FIELD_LIMIT_REACHED }=The number of attributes in a group must not exceed {MAX_LIMIT_VALUE}.
export enum AttributeMessages {
    FIELD_EXISTS = "360.admin.AttributeMessages.FIELD_EXISTS",
    FIELD_LIMIT_REACHED = "360.admin.AttributeMessages.FIELD_LIMIT_REACHED",
    GROUP_LIMIT_REACHED = "360.admin.AttributeMessages.GROUP_LIMIT_REACHED",
    GROUP_FIELD_LIMIT_REACHED = "360.admin.AttributeMessages.GROUP_FIELD_LIMIT_REACHED"
}

export interface AttributesSaveConfig {
    groups: AttributeGroup[];
}