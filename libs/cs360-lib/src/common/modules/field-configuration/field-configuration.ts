import { GSFieldMeta } from "@gs/gdk/core/types";
import { fieldInfo2path, findPath, path2FieldInfo } from "@gs/gdk/utils/field";
import { GSField } from "@gs/gdk/core";
import { DataTypes, FormatOptionTypes } from './../../cs360.defaults';
import { includes, isEmpty, get } from 'lodash';
import { ObjectNames, PageContext } from './../../cs360.constants';
import { IADMIN_CONTEXT_INFO } from '../../admin.context.token';
import { WidgetCategoryType, WidgetItemCategory, WidgetItemSubType } from '../../pojo';

export interface FieldConfigurationOptions {
    showEditable?: boolean;
    showDescription?: boolean;
    showType?: boolean;
    showDecimals?: boolean;
    showNumericSummarization?: boolean;
    showRequired?: boolean;
    showRollup?: boolean;
    showAggregationType?: boolean;
    showSearchConfig?: boolean;
    showWidth?: boolean;
    showLookupDisplayField?: boolean;
    skipFieldPathCheck?: boolean;
}

export interface FieldConfigurationActionInfo {
    action: FieldConfigurationActions;
    field: CustomizedField;
}

export enum FieldConfigurationActions {
    SAVE = "SAVE",
    CANCEL = "CANCEL"
}

export const Customize_Field_Options = {
    "type": [DataTypes.CURRENCY, DataTypes.NUMBER],
    "scale": [DataTypes.PERCENTAGE, DataTypes.CURRENCY, DataTypes.NUMBER],
    "numericalSummarization": [FormatOptionTypes.CURRENCY, FormatOptionTypes.NUMBER, FormatOptionTypes.FINANCIAL],
    "rollup": [DataTypes.PERCENTAGE, DataTypes.CURRENCY, DataTypes.NUMBER],
    "aggregateFunction": [DataTypes.PERCENTAGE, DataTypes.CURRENCY, DataTypes.NUMBER]
}

export function getDefaultFormat(dataType: string) {
    if (includes(Customize_Field_Options.type, dataType)) {
      return dataType;
    }
}

export function getDefaultNumericalSummarization(dataType: string) {
    if (includes(Customize_Field_Options.numericalSummarization, dataType)) {
        return 'DEFAULT';
    }
}

export function getIsEditDisabled(field: any, ctx: IADMIN_CONTEXT_INFO) {
    const widgetCategory = field.widgetCategory;
    const subType = field.subType;
    let editDisabled = (field.meta && !field.meta.updateable) || !!field.fieldPath;

    if(ctx.standardLayoutConfig.groupByType && field.objectName === ObjectNames.COMPANY && (field.fieldPath && !field.fieldPath.fieldPath)) {
     editDisabled = field.meta && !field.meta.updateable;
    }

    if(widgetCategory === 'Standard' && subType === 'CSM'){
        editDisabled = false;

        if(field.config.fieldName == 'ModifiedBy' || field.config.fieldName == 'CreatedBy' ){
            editDisabled = true;
        }
    }

    if(ctx.associatedObjectsNonEditableFields && ctx.associatedObjectsNonEditableFields.includes(field.fieldName.toLowerCase())) {
        editDisabled = true;
    }


    return editDisabled;
}

function isLookupDisplayFieldSupported(field): boolean {
    const lookupObjectName = get(field, 'data.meta.lookupDetail.lookupObjects[0].objectName');
    return ![ObjectNames.SCORECARD_MASTER, ObjectNames.SCORING_SCHEME_DEFINITION].includes(lookupObjectName);
}

export function getLookupDisplayField(section, children = section.children) {
    if(section.dataType === DataTypes.LOOKUP && children && isLookupDisplayFieldSupported(section)) {
        let nameField = children.find(x => x.data.fieldName === "Name") || children.find(x => x.data.fieldName === "Name__gc") || children.find(x => x.data.fieldName === "Gsid");
        if(!nameField) {
            return;
        }

        nameField.parent = section;
        
        const path = findPath(nameField);
        const fieldInfo = path2FieldInfo([...path],{}, true);
        if (!path[path.length - 1]) {
            return {
                ...nameField.data
            };
        }

        return {
            ...nameField.data,
            ...fieldInfo
        };
    }
}

export function findFieldInTree(field, tree) {
    const keyPath = [field.key];
    let parent = field.parent;
    while(parent) {
        keyPath.unshift(parent.key);
        parent = parent.parent;
    }

    let obj = tree;
    keyPath.forEach(key => {
        obj = obj.children.find(fld => fld.key === key);
    });

    return obj;
}

export function findFieldInTreeByFieldPath(field, tree) {
    const pathArray = fieldInfo2path({leftOperand: field}, tree.children);
    return pathArray[pathArray.length - 1];
}

export function getPathArrayFromFieldPath(field) {
    let fieldPath = field && field.fieldPath;
    const pathArray = [];

    while(fieldPath) {
        pathArray.push(fieldPath.right.fieldName);
        fieldPath = fieldPath.fieldPath;
    }

    pathArray.push(field && field.fieldName);

    return pathArray;
}

interface IMETA extends GSFieldMeta {
    properties ?: any;
}
export interface CustomizedField extends GSField {
    baseObjectName?:string;
    description?: boolean;
    aggregateFunction?: string;
    lookupDisplayField?: GSField;
    nameField?: GSField; // adding this for UI rendering
    searchableFields?: GSField[]; // adding this for UI rendering
    scale?: number;
    sectionScope?: string;
    itemId? :string;
    hidden?: boolean;
    meta? : IMETA;
    formatOptions?: {
        numericalSummarization?: string;
        type?: string;
    },
    axisDetails? : {
        x : number;
        y : number;
    };
    dimensionDetails? : {
        rows : number;
        cols : number;
    };
    properties?:{
        editable?: boolean;
        requiredDisabled?: boolean;
        required?: boolean;
        width?: any;
        rollup?: any;
        SEARCH_CONTROLLER?: any;
        navigationConfig?: any;
        editDisabled? :any;
    }
    showNavigationOption? :any;
    isEditing?: boolean;
    isSaving?: boolean;
    path?: any;
    tooltip?: any;
    tooltipPathLabels?:Array<string>;
    config?: any;
}

export const DefaultConfigOptions = {
    showDescription: true,
    showType: true,
    showDecimals: true,
    showNumericSummarization: true,
    showRequired: true,
    showEditable: true,
    showWidth: true
}

export class FieldConfigurationUtils {

    static getFieldConfigOptions(field: CustomizedField, fieldConfigOptions: FieldConfigurationOptions) {
        const fieldConfigControlOptions = !isEmpty(fieldConfigOptions) ? {...DefaultConfigOptions, ...fieldConfigOptions} : {...DefaultConfigOptions};
        fieldConfigControlOptions.showRequired = fieldConfigControlOptions.showRequired && (field.meta && field.meta.properties.editable || (field.properties && field.properties.editable));
        fieldConfigControlOptions.showNumericSummarization = fieldConfigControlOptions.showNumericSummarization && includes(Customize_Field_Options.numericalSummarization, field.formatOptions && field.formatOptions.type ? field.formatOptions.type : field.dataType);
        fieldConfigControlOptions.showType = fieldConfigControlOptions.showType && includes(Customize_Field_Options.type, field.dataType);
        fieldConfigControlOptions.showDecimals = fieldConfigControlOptions.showDecimals && includes(Customize_Field_Options.scale, field.dataType);
        fieldConfigControlOptions.showRollup = fieldConfigControlOptions.showRollup && includes(Customize_Field_Options.rollup, field.dataType) && !field.fieldPath;
        fieldConfigControlOptions.showAggregationType = fieldConfigControlOptions.showAggregationType && includes(Customize_Field_Options.aggregateFunction, field.dataType) && (fieldConfigOptions.skipFieldPathCheck ? true :!field.fieldPath);
        fieldConfigControlOptions.showLookupDisplayField = fieldConfigControlOptions.showLookupDisplayField && ((field.meta && field.meta.hasLookup || field.dataType === DataTypes.LOOKUP) && (field.fieldPath ? !field.fieldPath.fieldPath : true));
        fieldConfigControlOptions.showSearchConfig = fieldConfigControlOptions.showSearchConfig && field.meta && field.meta.hasLookup && (field.meta.properties.editable || (field.properties && field.properties.editable));
        return fieldConfigControlOptions;
    }

    static isFieldCustomizable(field: CustomizedField, fieldConfigOptions: FieldConfigurationOptions) {
        const options = this.getFieldConfigOptions(field, fieldConfigOptions);
        return options.showType || options.showRollup || options.showAggregationType || options.showDecimals || options.showLookupDisplayField;
    }
}
