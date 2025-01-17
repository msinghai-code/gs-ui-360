import {GSGlobalFilter} from "@gs/gdk/filter/global/core/global-filter.interface";
// import { Section, SectionCategory } from "@gs/cs360-lib";
import { Section, SectionCategory } from "../../admin-sections/modules/shared/section-listing/section-listing.interface";
import { LayoutSectionScope, LayoutStatus } from "./layout-upsert.constants";
import { LayoutSharingType } from "@gs/cs360-lib/src/common";

export interface LayoutSection extends Section {
    sectionType: string;
    allowedInGlobalSection: boolean;
    configured?: boolean;
    configurable?: boolean;
    showWarning?: boolean;
    sectionName?: string;
    relationshipTypeId?: string;
    description?: string;
    showLabelInput?: boolean;
    associatedObjects?: string[];
    decoupled?: boolean;
    scope?: LayoutSectionScope;
    sectionLabel?: string; // for global sections only
}

export interface LayoutDetails {
    name: string;
    layoutId: string;
    default?: boolean;
    status?: string;
    displayOrder?: string;
    relationshipTypeId?: string;
    entityType?: string;
    sharingType?: LayoutSharingType;
    description?: string;
    sectionCount?: number;
    sections?: LayoutSection[];
    data? : any;
    managedAs?: string;
}

export interface LayoutAssignmentDetails {
    filter: GSGlobalFilter;
    layoutStatus: LayoutStatus;
    layoutId: string;
    assignmentId: string;
    entityType: string;
    sharingType: LayoutSharingType;
    relationshipTypeId?: string;
}

export interface LayoutSectionsConfigureMeta {
    sectionCategories: SectionCategory[];
    layoutDetails: LayoutDetails;
}

export interface LayoutAssignMeta {
    layoutDetails: LayoutDetails;
    layoutAssignInfo: any;
}

