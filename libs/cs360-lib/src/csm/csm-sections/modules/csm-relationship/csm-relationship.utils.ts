/**
 * created by rpal on 31 may 2021
 */

import { ReportFilter} from "@gs/report/pojos";
import { ReportFilterUtils} from "@gs/report/utils";
import { GSField } from "@gs/gdk/core";
import {DEFAULT_VIEW} from "./csm-relationship.constants";

export function isFieldFromLookup(field: GSField) {
    return field.fieldPath;
}

export function getInlineFilters(field: any, operator: string, alias: string, value: any): any {
    return {
        conditions: {
            leftOperand: {...field, type: "BASE_FIELD"},
            filterAlias: alias,
            comparisonOperator: operator,
            includeNulls: false,
            ...ReportFilterUtils.getFilterValues(field, value, operator, {})
        },
        expression: alias
    }
}

export function getDefaultRelationshipState() {
    return {
        filters: ReportFilterUtils.emptyFilters(),
        selectedView: DEFAULT_VIEW,
        selectedRelType: 'ALL'
    }
}
//360.csm.relationship.type = Relationship Type
export function getRelationshipTypeFilterCondition(filterValue: string): ReportFilter {
    return {
        conditions: [{
            leftOperand: {
                type: "BASE_FIELD",
                fieldName: "Name",
                fieldPath: {
                    "lookupId": "TypeId__gr",
                    "legacyLookupId": null,
                    "lookupName": "TypeId__gr",
                    "left": {
                        "type": "BASE_FIELD",
                        "fieldName": "Gsid",
                        "objectName": "relationship_type",
                        "hasLookup": false
                    },
                    "right": {
                        "type": "BASE_FIELD",
                        "fieldName": "TypeId",
                        "objectName": "relationship",
                        "hasLookup": false
                    },
                    "fieldPath": null,
                    "joinType": null
                },
                dataType: "string",
                objectName: "relationship_type",
                label: "360.csm.relationship.type",
                properties: {
                    readOnly: true
                }
            },
            includeNulls: false,
            filterAlias: "RX",
            filterValue: {
                value: [filterValue]
            },
            comparisonOperator: "EQ",
            rightOperandType: "VALUE"
        }],
        expression: "RX"
    }
}

export function getCompanyFilterCondition(value: string): ReportFilter {
    return {
        conditions: [{
            leftOperand: {
                type: "BASE_FIELD",
                dataType: "LOOKUP",
                fieldName: "CompanyId",
                label: "Company Id",
                objectName: "relationship"
            },
            includeNulls: false,
            filterAlias: "CX",
            filterValue: {
                value: [value]
            },
            comparisonOperator: "EQ",
            rightOperandType: "VALUE"
        }],
        expression: "CX"
    }
}