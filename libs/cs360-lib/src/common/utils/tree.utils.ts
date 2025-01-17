import {FieldTreeNode} from "@gs/gdk/core/types";
import {GSField} from "@gs/gdk/core";
import {findPath, path2FieldInfo} from "@gs/gdk/utils/field";

export function getSearchableFields(node: FieldTreeNode, field: GSField): GSField[] {
    const searchableFields = [];
    if (
        field.properties &&
        field.properties.SEARCH_CONTROLLER &&
        field.properties.SEARCH_CONTROLLER.fields &&
        field.properties.SEARCH_CONTROLLER.fields.length
    ) {
        (node.children || []).forEach(node => {
            if ((field.properties.SEARCH_CONTROLLER.fields || [])
                .find(fieldName => fieldName === node.data.fieldName)
            ) {
                const path = findPath(node);
                const field = path2FieldInfo(path);
                if (path && field) {
                    searchableFields.push(field);
                }
            }
        });
    }
    return searchableFields;
}
