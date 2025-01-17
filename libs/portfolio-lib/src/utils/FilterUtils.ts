import isEmpty from "lodash/isEmpty";
import concat from "lodash/concat";
import {FilterInfo, PortfolioGSField} from "../pojos/portfolio-interfaces";
import {findPath, path2FieldInfo} from "@gs/gdk/utils/field";
import {FieldUtils} from "./FieldUtils";
import {FilterMap} from "./FilterMap";

export namespace FilterUtils {
    export function addFilters(filters: FilterInfo = { conditions: [], expression: "" }, additionalFilters: any[], position: string = "LAST"): any {
        const expressionList: any[] = [];
        if(isEmpty(filters)) {
            filters = { conditions: [], expression: "" };
        }
        if(!!additionalFilters && additionalFilters.length) {
            switch (position) {
                case 'LAST':
                    for(const filter of additionalFilters) {
                        // Update conditions
                        if(Array.isArray(filter.conditions)) {
                            filters.conditions = concat((filters.conditions || []), filter.conditions);
                        } else {
                            filters.conditions = concat((filters.conditions || []), [filter.conditions]);
                        }
                        // Add expression to list
                        if(!!filter.expression) {
                            expressionList.push(filter.expression);
                        }
                    }
                    if(expressionList.length) {
                        if (!!filters.expression) {
                            filters.expression = `( ${filters.expression} ) AND ${expressionList.join(' AND ')}`;
                        } else {
                            filters.expression = expressionList.join(' AND ');
                        }
                    }
                    break;
                case 'FIRST':
                    for(const filter of additionalFilters) {
                        // Update conditions
                        filters.conditions = concat([filter.conditions], filters.conditions || []);
                        // Add expression to list
                        if(!!filter.expression) {
                            expressionList.push(filter.expression);
                        }
                    }
                    if(!!filters.expression) {
                        filters.expression = expressionList.length ? `( ${expressionList.join(' AND ')} ) AND ( ${filters.expression} )`: filters.expression;
                    } else {
                        filters.expression = expressionList.length ? expressionList.join(' AND '): filters.expression;
                    }
                    break;
            }
        }

        return filters;
    }

    export function getFilterAlias(filters: any, index: number) {
        const aliases = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        const filterCount = !!filters.conditions ? filters.conditions.length: 0;
        return aliases[filterCount + index];
    }

    export function getWhereFilters(field: PortfolioGSField, operator: string, alias: string, value: any, options?: any) {
        const comparisonOperator: string = FilterMap.OperatorMap[operator] || operator;
        const conditions: any =
            serializeRecord({data:field}, comparisonOperator, alias, getFilterValues(field, value, comparisonOperator, options));
        conditions.leftOperand = {
            ...conditions.leftOperand,
            fieldPath: field.fieldPath,
            expressionDetails: FieldUtils.getExpressionDetails(field),
            fieldType: field.fieldType
        };
        return {
            conditions,
            expression: alias
        };
    }

    export function serializeRecord(selectedField, comparisonOperator, filterAlias, value, selectedFieldPathId?) {
        let leftOperand = selectedField;
        if (!selectedField.fieldPath) {
            const path = findPath(selectedField);
            leftOperand = path2FieldInfo(path);
        }
        if (leftOperand.dataType === "CURRENCY" && value.filterValue) {
            leftOperand.currencyCode = value.filterValue.currencyCode;
        }

        /**
         * Properties are used to display read only elements
         * such as auto suggest details(User) => eg: CURRENT_USER
         * and pathLabel is used to display path on tooltip
         */
        const properties = selectedField.properties ? {
            ...selectedField.properties,
            pathLabel:  selectedFieldPathId
        } : ( selectedField.data && selectedField.data.meta && {
            ...(selectedField.data.meta.properties || {}),
            pathLabel:  selectedFieldPathId
        }) || null;

        leftOperand = {
            ...leftOperand,
            properties
        };

        return {
            leftOperand,
            filterAlias,
            comparisonOperator,
            ...value
        };
    }

    export function getFilterValues(field: PortfolioGSField, value: any, comparisonOperator: string, options: any = {}) {
        const derivedFieldDatatype: string = FieldUtils.getFieldDerivedDatatype(field).toUpperCase();
        switch (derivedFieldDatatype) {
            case 'DATE':
            case 'DATETIME':
                return {
                    filterValue: {
                        value: getValues(value, comparisonOperator),
                        dateOptions: {
                            format: "YYYY-MM-DD",
                            timeZoneId: "UTC"
                        },
                        dateLiteral: options.literal || "CUSTOM"
                    },
                    rightOperandType: "VALUE"
                };
            default:
                return {
                    filterValue: { value: getValues(value, comparisonOperator) },
                    rightOperandType: "VALUE"
                };
        }
    }

    export function getValues(value: string, comparisonOperator: string): any {
        return ['IS_NULL', 'IS_NOT_NULL'].indexOf(comparisonOperator) === -1
            ? Array.isArray(value) ? value: [value]
            : null
    }

    export function getFilterOptionsDef(filterOptions: any = []): any[] {
        return filterOptions.map((op: any) => {
            return {displayKey: op.value, displayName: op.value, predicate: () => true};
        });
    }

    export function isFieldFilterable(field: PortfolioGSField) {
        if(FieldUtils.hasAggregation(field)) {
            const derivedColDatatype: string = FieldUtils.getFieldDerivedDatatype(field).toUpperCase();
            return FilterMap.systemToPrimitiveDatatypeFilterableMap[derivedColDatatype];
        } else if(FieldUtils.hasSummerization(field)) {
            const key: string = FieldUtils.getExpressionDetailsKey(field);
            return FilterMap.ENABLE_SUMMARIZE_BY_COLUMN_FILTER.indexOf(key) >= 0;
        } else {
            return field.filterable // Check for system defined filter property
                && FilterMap.systemToPrimitiveDatatypeFilterableMap[field.dataType.toUpperCase()]; // check for CRM specific filterable map
        }
    }
}
