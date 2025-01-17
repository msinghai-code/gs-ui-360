import {IRelationshipSummaryRibbonConfig, RelationshipConfigCustomizedField} from "./relationship-layout-configuration";
import { getUUID } from "@gs/gdk/utils/common";
import { fieldInfo2path, getFieldInfoFromTreeNode } from "@gs/gdk/utils/field";
import { GSField } from "@gs/gdk/core";
import { Cs360ContextUtils, DataTypes } from '@gs/cs360-lib/src/common';
import { FieldConfigurationUtils } from '@gs/cs360-lib/src/common';
import {isEmpty, get} from "lodash";
import { WidgetCategoryType } from '@gs/cs360-lib/src/common';

export function convertToConfig(fieldInfo: any): RelationshipConfigCustomizedField {
    const {
        fieldName,
        itemId,
        label,
        dataType,
        objectName,
        properties, formatOptions, description, aggregateFunction, scale, fieldPath, rows, cols, x, y, dragEnabled, lookupDisplayField } = fieldInfo;
    return {
        fieldName,
        itemId,
        label,
        dataType,
        objectName,
        formatOptions,
        description,
        aggregateFunction,
        scale,
        fieldPath,
        properties: {
            ...properties,
            dragEnabled
        },
        dimensionDetails: {
            rows,
            cols
        },
        axisDetails: {
            x,
            y
        },
        lookupDisplayField
    };
}

export function convertToUIConfig(fieldInfo: RelationshipConfigCustomizedField, options: any): any {
    const {
        fieldName,
        itemId,
        label,
        dataType,
        objectName,
        properties, formatOptions, description, aggregateFunction, scale, fieldPath, dimensionDetails, axisDetails, lookupDisplayField } = fieldInfo;
    const path = fieldInfo2path({leftOperand: fieldInfo}, options.treeObj);
    const selectedField: any = path[path.length - 1];
    if(!isEmpty(selectedField)) {
        return {
            fieldName,
            itemId: !!itemId ? itemId: getNewItemId(), // fallback if itemId is not present
            label,
            dataType,
            objectName,
            formatOptions, description, aggregateFunction, scale, fieldPath,
            dragEnabled: isFieldDraggable(fieldInfo),
            properties,
            ...dimensionDetails,
            ...axisDetails,
            customizable: !(fieldInfo.dataType === DataTypes.LOOKUP && get(fieldInfo, 'fieldPath.fieldPath')) && FieldConfigurationUtils.isFieldCustomizable(selectedField.data, { showAggregationType: true, skipFieldPathCheck: true, showLookupDisplayField: true }),
            lookupDisplayField
        }
    } else {
        return {};
    }
}

export function convertToSummaryRibbonConfig(itemConfig: any): IRelationshipSummaryRibbonConfig {
    const { itemId, widgetCategory, config, rows, cols, x, y, attributeId, attributeCategory, label, customizable, aggregateFunction, formatOptions, scale } = itemConfig;
    if(attributeId) {
        return {
            itemId,
            label,
            widgetCategory,
            attributeId,
            attributeCategory,
            config: {},
            dimensionDetails: {rows, cols},
            axisDetails: {x, y}
        }
    } else {
        return {
            itemId,
            label,
            widgetCategory,
            config: {...config, aggregateFunction, formatOptions, scale},
            dimensionDetails: {rows, cols},
            axisDetails: {x, y}
        }
    }
}

export function convertToUISummaryRibbonConfig(itemConfig: IRelationshipSummaryRibbonConfig, options: any): any {
    const {  itemId, label, widgetCategory, attributeId, attributeCategory, config, dimensionDetails, axisDetails } = itemConfig;
    if(attributeId) {
        return {
            itemId, label,
            widgetCategory: widgetCategory || WidgetCategoryType.STANDARD,
            subType: attributeId,
            attributeId,
            attributeCategory,
            ...config,
            ...dimensionDetails,
            ...axisDetails,
            customizable: false
        }
    } else {
        const path = fieldInfo2path({leftOperand: config}, options.treeObj);
        const selectedField: any = path[path.length - 1];
        if(!isEmpty(selectedField)) {
            return {
                itemId,
                widgetCategory: widgetCategory || WidgetCategoryType.FIELD,
                config,
                ...config,
                ...config.properties,
                label,
                ...dimensionDetails,
                ...axisDetails,
                customizable: FieldConfigurationUtils.isFieldCustomizable(selectedField.data, { showAggregationType: true, skipFieldPathCheck: true })
            }
        } else {
            return {};
        }
    }
}

export function isFieldDraggable(field: any): boolean {
    if(field.fieldName === "Name" && field.objectName === Cs360ContextUtils.getRelationshipBaseObjectName()) {
        return false;
    }
    return true;
}

export function isHealthScoreField(fieldName: string, objectName: string): boolean {
    return fieldName === "CurrentScore" && objectName === Cs360ContextUtils.getRelationshipBaseObjectName();
}

export function getDecimalPlaces(field: GSField) {
    return field.meta && field.meta.decimalPlaces ? field.meta.decimalPlaces: 0;
}
export function getTooltipLabelData(path:Array<any>): {tooltipPathLabels:Array<string>,tooltip:string}{
    const tooltipPathLabels = path.map((field)=> field && field.label);
    return {
        tooltipPathLabels: [( path[0] && path[0].data ? path[0].data.objectLabel : '' ),...tooltipPathLabels],
        tooltip: tooltipPathLabels.join(" ➝ ")
    }
}
/**
 * Show field path info.
 */
export function getFieldPathInfo(field) {
    try {
        if(!isEmpty(field)) {
            const pathLabel = getFieldPath(field);
            //this.fieldPathLabel = pathLabel ? pathLabel + ' ➝ ' + field.fieldName : this.item.fieldName;
            return pathLabel;
        }
    } catch (e) {}
}

function getNewItemId(): string {
    return `bm_${getUUID()}`;
}


function getFieldPath(field, path? : string){
    if(field.fieldPath) {
        const fieldLabel = field.fieldPath.right.fieldLabel || field.fieldPath.right.fieldName;
        let pathLabel = path ? path + ' ➝ ' + fieldLabel : fieldLabel;
        return getFieldPath(field.fieldPath, pathLabel);
    } else {
        return path || "";
    }
}
