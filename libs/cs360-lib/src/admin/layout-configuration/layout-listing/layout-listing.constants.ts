import { COLUMN_VIEW } from "@gs/gdk/grid";
import { LayoutStatus } from "../layout-upsert/layout-upsert.constants";


export const ACTION_COLUMN_DETAIL = {
    headerName: '',
    field: 'action_column',
    fieldName: 'action_column',
    lockPosition: true,
    pinned: "right",
    stopRowSelection: true,
    suppressMovable: true,
    minWidth: 72,
    maxWidth: 72,
    width:72,
    resizable: false,
    columnDataType: COLUMN_VIEW.GRID_ACTION_COLUMN
};

export const PREVIEW_COLUMN_DETAIL = {
    headerName: '',
    field: 'preview_column',
    fieldName: 'preview_column',
    suppressMovable: true,
    lockPosition: true,
    pinned: "right",
    stopRowSelection: true,
    minWidth: 115,
    width:115,
    columnDataType: COLUMN_VIEW.PREVIEW_ACTION_COLUMN,
    cellClass: 'preview-column'
};

export enum LAYOUT_LISTING_CONTEXT {
  STANDARD = "STANDARD",
  COMMON = "COMMON"
}

export enum CONTEXT_MENU_LABELS {
  CONTINUE_DRAFT = "360.admin.layout_listing_constants.CONTINUE_DRAFT",
  VIEW_EDIT = "360.admin.layout_listing_constants.VIEW_EDIT",
  DUPLICATE = "360.admin.layout_listing_constants.DUPLICATE",
  RENAME = "360.admin.layout_listing_constants.RENAME",
  ASSIGN_LAYOUT = "360.admin.layout_listing_constants.ASSIGN_LAYOUT",
  MARK_AS_DEFAULT = "360.admin.layout_listing_constants.MARK_AS_DEFAULT",
  DELETE_LAYOUT = "360.admin.layout_listing_constants.DELETE_LAYOUT"
}

export const CONTEXT_MENU_INFO = (data, context: LAYOUT_LISTING_CONTEXT, i18nService?) =>  {
    let contextMenuItems = [
        {
          id: "edit",
          icon: null,
          label: data.status === LayoutStatus.DRAFT ? i18nService.translate('360.admin.layout_listing_constants.CONTINUE_DRAFT') : i18nService.translate('360.admin.layout_listing_constants.VIEW_EDIT'),
          disabled: false,
        },
        {
          id: "rename", 
          icon: null,
          label: i18nService.translate('360.admin.layout_listing_constants.RENAME'),
          disabled: false
        },
        {
          id: "duplicate",
          icon: null,
          label: i18nService.translate('360.admin.layout_listing_constants.DUPLICATE'),
          disabled: false
        },
        {
          id: "assign",
          icon: null,
          label: i18nService.translate('360.admin.layout_listing_constants.ASSIGN_LAYOUT'),
          disabled: false,
          tooltip: i18nService.translate('360.admin.layout_listing_constants.assignTooltip')
        },
        {
          id: "delete",
          icon: null,
          label: i18nService.translate('360.admin.layout_listing_constants.DELETE_LAYOUT'),
          disabled: data.usageCount > 0 ? true: false,
          tooltip: i18nService.translate('360.admin.layout_listing_constants.assignTooltip')
        }
    ];
    if(context === LAYOUT_LISTING_CONTEXT.STANDARD) {
      contextMenuItems.splice(3, 0, {
        id: "default",
        icon: null,
        label:i18nService.translate('360.admin.layout_listing_constants.MARK_AS_DEFAULT'),
        disabled: false
      });
    }
    if(context === LAYOUT_LISTING_CONTEXT.COMMON) {
        // Remove assign layout from common sections
        contextMenuItems = contextMenuItems.filter(item => !["rename", "assign"].includes(item.id));
    }
    if(data.status === LayoutStatus.DRAFT) {
      return {contextMenuItems: contextMenuItems.filter(item => !["assign", "default"].includes(item.id))};
    } else if(data.default) {
      return {contextMenuItems: contextMenuItems.filter(item => !["delete", "assign", "default"].includes(item.id))};
    }
    return {contextMenuItems};
}
//{360.admin.arranged_success}=Layout arranged successfully.
export const LAYOUT_LISTING_CONSTANTS = {
    CLONED_SUCCESS: '{0} cloned successfully.',
    LAYOUT_REORDER_SUCCESS: '360.admin.arranged_success',
    DELETED_SUCCESS: '{0} deleted successfully.',
    MARKED_AS_DEFAULT: '{0} marked as default',
    DELETED_FAILURE: 'Unable to delete {0}',
    CLONED_FAILURE: 'Unable to clone {0}'
}

// This is used in common layout component for translation
export const COMMON_LAYOUT_LISTING_CONSTANTS = {
    CLONED_SUCCESS: '360.admin.common_layout.CLONED_SUCCESS',
    DELETED_SUCCESS: '360.admin.common_layout.DELETED_SUCCESS',
    MARKED_AS_DEFAULT: '360.admin.common_layout.MARKED_AS_DEFAULT',
    DELETED_FAILURE: '360.admin.common_layout.DELETED_FAILURE',
    CLONED_FAILURE: '360.admin.common_layout.CLONED_FAILURE'
}

