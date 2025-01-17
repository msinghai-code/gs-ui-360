import isEmpty from "lodash/isEmpty";
import {ExpressionDetails, PortfolioGSField} from "../pojos/portfolio-interfaces";
import {GSField} from "@gs/gdk/core";
import {FilterMap} from "./FilterMap";

export namespace FieldUtils {
    export function isFieldGroupable(field: any) {
        return !!field.meta ? field.meta.groupable || field.meta.groupableByDate: true;
    }

    export function getDecimalPlaces(scale: number, range: {min: number, max: number} = {min: 0, max: 3}) {
        if(scale < range.min) {
            return range.min;
        } else if(scale > range.max) {
            return range.max;
        } else {
            return scale;
        }
    }

    export function constructFieldAlias(field: PortfolioGSField, discardExpressionDetails: boolean = false): string {
        try {
            let fieldAliasFromPath: string[] = [];
            const expressionDetails = field.expressionDetails;
            const objectName: string = field.objectName || 'FF';
            const fieldName: string = field.fieldName;
            if(!isEmpty(field.fieldPath)) {
                fieldAliasFromPath = constructFieldAliasFromFieldPath(field.fieldPath);
            }
            if (!discardExpressionDetails && !!expressionDetails && expressionDetails.expression && expressionDetails.expression.key) {
                let key: string = expressionDetails.expression.key.toLowerCase();
                if(key === 'summarize') {
                    const summarizationDetails = expressionDetails.expression.arguments[expressionDetails.expression.arguments.length - 1];
                    key = `${key}_${summarizationDetails.value.toLowerCase()}`;
                }
                return [key, 'of', objectName, ...fieldAliasFromPath, fieldName].filter(v => !!v).join('_');
            } else {
                return [objectName, ...fieldAliasFromPath, fieldName].filter(v => !!v).join('_');
            }
        } catch(e){
            console.error(e);
        }
    }

    export function constructFieldAliasFromFieldPath(fieldPath: any): string[] {
        const partialFieldAlias = [];
        if(!!fieldPath && !fieldPath.fieldPath) {
            return [fieldPath.lookupId];
        } else {
            partialFieldAlias.push(...constructFieldAliasFromFieldPath(fieldPath.fieldPath));
            partialFieldAlias.push(fieldPath.lookupId);
        }

        return partialFieldAlias;
    }

    export function isFieldDateType(field: GSField): boolean {
        const datatype: string = field.dataType.toUpperCase();
        if(hasAggregation(field)) {
            if(["DATE", "DATETIME"].indexOf(datatype) >= 0) {
                const expressionKey = getFieldAggregation(field);
                return !!expressionKey && ['MIN','MAX'].indexOf(expressionKey) >= 0;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    export function hasAggregation(field: GSField) {
        const expressionDetails: ExpressionDetails = getExpressionDetails(field);
        return !!expressionDetails && expressionDetails.expressionType && expressionDetails.expressionType === 'aggregationFunction';
    }

    export function getFieldAggregation(field: (GSField & {expressionDetails?: ExpressionDetails})): string {
        return field.expressionDetails && field.expressionDetails.expression && field.expressionDetails.expression.key;
    }

    export function getExpressionDetails(field: (GSField & {expressionDetails?: ExpressionDetails})): ExpressionDetails {
        return field.expressionDetails;
    }

    export function hasSummerization(field: GSField) {
        const expressionDetails: ExpressionDetails = getExpressionDetails(field);
        return !!expressionDetails && expressionDetails.expression && expressionDetails.expression.key === 'summarize';
    }

    export function getFieldDerivedDatatype(field: GSField): string {
        if(hasAggregation(field)) {
            const expressionDetails = getExpressionDetails(field);
            return outputDatatypeByAggregation(field, expressionDetails.expression.key);
        } else if(hasSummerization(field)) {
            const expressionDetails = getExpressionDetails(field);
            return outputDatatypeBySummerization(field, expressionDetails.expression.arguments[1]);
        }else {
            const datatype = field.dataType && field.dataType.toUpperCase();
            return FilterMap.systemToPrimitiveDatatypeMap[datatype] || 'string';
        }
    }

    export function outputDatatypeByAggregation(field: GSField, key: string) {
        const datatype: string = field.dataType.toUpperCase();
        if(["COUNT", "COUNT_DISTINCT"].indexOf(key) >= 0) {
            return "NUMBER";
        } else {
            return datatype;
        }
    }

    export function outputDatatypeBySummerization(field: GSField, token: {value: string, tokenType: string, dataType: string}): string {
        // const datatype: string = field.dataType.toUpperCase();
        if(["DAY", "WEEK"].indexOf(token.value.toUpperCase()) >= 0) {
            /**
             * In reporting, all datetime fields in groupby are treated as date field in grid.
             * In order to make behavior same in here, returing `Date` as derived datatype
             **/
            return 'date';
        } else if(["MONTH", "QUARTER", "YEAR"].indexOf(token.value.toUpperCase()) >= 0) {
            return "string";
        } else {
            return 'date';
        }
    }

    export function isFieldRowGrouped(field: PortfolioGSField): boolean {
        return field.rowGrouped;
    }

    export function isFieldPivoted(field: PortfolioGSField): boolean {
        return field.pivoted;
    }

    export function isComplexFiscalConfigured(field: PortfolioGSField) {
        const fieldProperties = FieldUtils.getProperties(field);
        if(!isEmpty(fieldProperties) && fieldProperties.complexFiscalConfig) {
            return true;
        }
        return false;
    }

    export function getProperties(field: PortfolioGSField): any {
        return field.properties;
    }
    export function getExpressionDetailsKey(field: PortfolioGSField): string {
        if(hasAggregation(field) || hasSummerization(field)) {
            const expressionDetails = getExpressionDetails(field);
            if (!!expressionDetails && expressionDetails.expression && expressionDetails.expression.key) {
                let key: string = expressionDetails.expression.key;
                if(key === 'summarize') {
                    const summarizationDetails = expressionDetails.expression.arguments[expressionDetails.expression.arguments.length - 1];
                    key = summarizationDetails.value;
                }
                return key.toUpperCase();
            }
        }
    }
}
