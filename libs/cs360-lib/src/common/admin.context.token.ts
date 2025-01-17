import { InjectionToken } from "@angular/core";
import { LayoutSharingType } from './cs360.defaults';

export const ADMIN_CONTEXT_INFO = new InjectionToken('ADMIN_CONTEXT_INFO') as IADMIN_CONTEXT_INFO;

export interface IADMIN_CONTEXT_INFO {
    pageContext?: string;
    associatedContext?: string;
    cdnPath?: string;
    // relationshipTypeId?: string;
    contextType?: string;
    contextTypeId?: string;
    [key: string]: any;
    objectName?: string;
    baseObject?: string;
    isPartnerUsecaseSupported?: boolean;
    associatedObjects?: string[];
    associatedObjectsDisabledFields?: string[];
    associatedObjectsNonEditableFields?: string[];
    layoutTabName?: string;
    standardLayoutConfig?: StandardLayoutConfig;
    previewConfig?: any;
    subTitle?: string;
    translatedBaseObjectLabel?: string;
    sharingType?: LayoutSharingType;
    standardWidgetConfig?: StandardWidgetConfig;
    layoutConfigurationTabs?: { label: string, link: string, id: number, displayIf?: string}[];
    manageAssignmentConfig?: ManageAssignmentConfig; // Manage assignment
    layoutAssignConfig?: LayoutAssignConfig; // Layout assign config for assign tab in layout details
    hidePrebuiltSectionsToConfigure?: boolean; // default false
    endUserPreview?: boolean // default false
}

export interface StandardLayoutConfig {
    sortBy: string;
    groupByType?: GroupByType;
    // objectName: string;
    // baseObject: string;
    labelForTranslation: string;
    extraColInfo?: any;
  }

  export interface GroupByType {
    type: string,
    typeId: string
  }
  export interface StandardWidgetConfig {
    [key: string]: any;
  }
  export interface ManageAssignmentConfig {
    showManageAssignment: boolean;
    lookupFields: {
      searchTerm: string;
      objectName: string; 
      forceSearch: boolean; 
      fields: string[];
    }[]
  }
  export interface LayoutAssignConfig {
    objectList: ObjectList[];
  }
  export interface ObjectList {
    objectLabel: string;
    objectName: string;
    excludeFields: any[];
    nestLevels:number;
  }
