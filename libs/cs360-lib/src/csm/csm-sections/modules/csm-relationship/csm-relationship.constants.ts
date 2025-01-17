/*
 * created by rpal on jun 23, 2021
 */

import { COLUMN_VIEW } from "@gs/gdk/grid";
import { ActionColumnRenderer } from "./relationship-view/relationship-list-view/processors/gs-column-action-renderered.component";

export interface ICsmRelationshipState {
    selectedView?: string;
    selectedRelType?: string;
    selectedFilters?: any;
    columnsState?: {[key: string]: any};
}
//not translating as it is not used anywhere!!
export const defautColumns = [
    {
        field: 'label',
        headerName: 'Relationship Name',
        minWidth: 300,
        dataType: 'string'
    },
    {
        field: 'type',
        headerName: 'Relationship Type',
        minWidth: 100,
        dataType: 'string'
    }
];

export const ACTION_COLUMN_DETAIL = {
    headerName: '',
    field: 'action_column',
    fieldName: 'action_column',
    lockPinned: true,
    pinned: "right",
    stopRowSelection: true,
    minWidth: 50,
    maxWidth: 50,
    width: 50,
    cellRendererFramework: ActionColumnRenderer,
    columnDataType: COLUMN_VIEW.GRID_ACTION_COLUMN,
    headerComponent: "gsColumnChooserRendererComponent",
    headerComponentParams: {
        columns: [],
        disabledFields: ["Relationship Name"],
        applyColumnSelection: (selectedColumns) => {
            // this.onColumnUpdated(selectedColumns);
        },
        selectedColumns: ['selectedColumns'],
        dataKey: "label",
        maxSelectionAllowed: 4,
        showSearch: false,
        showSelectAll: false
    },
    cellRendererParams: {},
    actionLabels: {}
};

export enum CONTEXT_MENU_LABELS {
    EDIT = "360.admin.CONTEXT_MENU_INFO.EDIT",
    DELETE = "360.admin.CONTEXT_MENU_INFO.DELETE"
}


export const CONTEXT_MENU_INFO = {
    contextMenuItems: [
        {
            id: "edit",
            icon: null,
            label: CONTEXT_MENU_LABELS.EDIT,
            type: 'EDIT',
            disabled: false
        },
        {
            id: "delete",
            icon: null,
            label: CONTEXT_MENU_LABELS.DELETE,
            type:'DELETE',
            disabled: false
        }
    ]
}

export const ROW_IDENTIFIER_KEY = "rowIdentifierGSID";
export const RELTYPE_ROW_IDENTIFIER_KEY = "rowIdentifierRelTypeGSID";
export const DEFAULT_VIEW = "LIST";
