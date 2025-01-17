import {FilterFunction, FieldSearchSetting, GSTreeOption, ResolveMultipleLookups, GSField} from "@gs/gdk/core";
import { FieldTreeRoot } from "@gs/gdk/field-tree";

export interface FieldTreeViewOptions {
    baseObject: string;
    root: FieldTreeRoot;
    fieldSearchSetting: FieldSearchSetting;
    pageSize?: number;
    selectionMode?: "single" | "checkbox" | "multiple";
    showTooltip?:boolean;
    expandAll?: boolean;
    maxNestLevels?: number;
    nestOnDemand?: boolean;
    enablePartialTree?: boolean;
    allowedDataTypes?: string[];
    host?: any;
    filterFunction?: FilterFunction;
    skipFilter?: boolean;
    honorCustomLookup?: boolean;
    fieldPathLabel?: string;
    autoExpandNesting?: boolean;
    allowedFields?: string[];
    fieldInfo?: any;
    showLookupInfo?: boolean;
    cdkDropListConnectedTo?: string;
    resolveMultipleLookups?: ResolveMultipleLookups;
    allowUnSelectEvent?: boolean;
    emitInitialSelection?: boolean;
    dragOptions?: any;
    disableNodeUnSelectBehavior?: boolean;
    allowSelectEvent?: boolean;
}

export enum FieldTreeViewActions {
    SelectedFieldChange = "SelectedFieldChange",
    BaseObjUpdate = "BaseObjUpdate",
    NodeExpand = "NodeExpand",
    BaseTreeAction = "BaseTreeAction"
}

export const DefaultFieldSearchSetting = {
    minQueryLength: 1,
    includeUnmatchedParents: true,
    maintainDefaultOrder: true
}

export const DefultFieldTreeViewOptions = {

}
