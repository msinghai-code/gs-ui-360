export namespace FloatingFilterMap {
    export const newOperatorMap = {
        STRING: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": false},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "CONTAINS", "label": "360.admin.operatorMap.contains", "default": true},
            { "value": "DOES_NOT_CONTAINS", "label": "360.admin.operatorMap.not_contain", "default": false},
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": false},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "STARTS_WITH", "label": "360.admin.operatorMap.starts_with", "default": false},
            { "value": "ENDS_WITH", "label": "360.admin.operatorMap.ends_with", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        GSID: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": false},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        SFDCID: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equals_to", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false},
            { "value": "DOES_NOT_CONTAINS", "label": "360.admin.operatorMap.not_contain", "default": false},
            { "value": "CONTAINS", "label": "360.admin.operatorMap.contains", "default": false},
            { "value": "STARTS_WITH", "label": "360.admin.operatorMap.starts_with", "default": false},
            { "value": "ENDS_WITH", "label": "360.admin.operatorMap.ends_with", "default": false},
        ],
        URL: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": false},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "CONTAINS", "label": "360.admin.operatorMap.contains", "default": true},
            { "value": "DOES_NOT_CONTAINS", "label": "360.admin.operatorMap.not_contain", "default": false},
            { "value": "STARTS_WITH", "label": "360.admin.operatorMap.starts_with", "default": false},
            { "value": "ENDS_WITH", "label": "360.admin.operatorMap.ends_with", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        EMAIL: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": false},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "CONTAINS", "label": "360.admin.operatorMap.contains", "default": true},
            { "value": "DOES_NOT_CONTAINS", "label": "360.admin.operatorMap.not_contain", "default": false},
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": false},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "STARTS_WITH", "label": "360.admin.operatorMap.starts_with", "default": false},
            { "value": "ENDS_WITH", "label": "360.admin.operatorMap.ends_with", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        TEXT: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": false},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "CONTAINS", "label": "360.admin.operatorMap.contains", "default": true},
            { "value": "DOES_NOT_CONTAINS", "label": "360.admin.operatorMap.not_contain", "default": false},
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": false},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "STARTS_WITH", "label": "360.admin.operatorMap.starts_with", "default": false},
            { "value": "ENDS_WITH", "label": "360.admin.operatorMap.ends_with", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        RICHTEXTAREA: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": false},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "CONTAINS", "label": "360.admin.operatorMap.contains", "default": true},
            { "value": "DOES_NOT_CONTAINS", "label": "360.admin.operatorMap.not_contain", "default": false},
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": false},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "STARTS_WITH", "label": "360.admin.operatorMap.starts_with", "default": false},
            { "value": "ENDS_WITH", "label": "360.admin.operatorMap.ends_with", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        PHONE: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": false},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "CONTAINS", "label": "360.admin.operatorMap.contains", "default": false},
            { "value": "DOES_NOT_CONTAINS", "label": "360.admin.operatorMap.not_contain", "default": false},
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": false},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "STARTS_WITH", "label": "360.admin.operatorMap.starts_with", "default": true},
            { "value": "ENDS_WITH", "label": "360.admin.operatorMap.ends_with", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        BOOLEAN: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false},
        ],
        DATE: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "GTE", "label": "360.admin.operatorMap.greater_equal", "default": false},
            { "value": "LTE", "label": "360.admin.operatorMap.less_equal", "default": false},
            { "value": "LT", "label": "360.admin.operatorMap.less_than", "default": false},
            { "value": "GT", "label": "360.admin.operatorMap.greater_than", "default": false},
            { "value": "BTW", "label": "360.admin.operatorMap.between", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        DATETIME: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "GTE", "label": "360.admin.operatorMap.greater_equal", "default": false},
            { "value": "LTE", "label": "360.admin.operatorMap.less_equal", "default": false},
            { "value": "LT", "label": "360.admin.operatorMap.less_than", "default": false},
            { "value": "GT", "label": "360.admin.operatorMap.greater_than", "default": false},
            { "value": "BTW", "label": "360.admin.operatorMap.between", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        MULTIPICKLIST: [
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": true},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        MULTISELECTDROPDOWNLIST: [
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": true},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        PICKLIST: [
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": true},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        INTEGER: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "GTE", "label": "360.admin.operatorMap.greater_equal", "default": false},
            { "value": "LTE", "label": "360.admin.operatorMap.less_equal", "default": false},
            { "value": "LT", "label": "360.admin.operatorMap.less_than", "default": false},
            { "value": "GT", "label": "360.admin.operatorMap.greater_than", "default": false},
            { "value": "BTW", "label": "360.admin.operatorMap.between", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        CURRENCY: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "GTE", "label": "360.admin.operatorMap.greater_equal", "default": false},
            { "value": "LTE", "label": "360.admin.operatorMap.less_equal", "default": false},
            { "value": "LT", "label": "360.admin.operatorMap.less_than", "default": false},
            { "value": "GT", "label": "360.admin.operatorMap.greater_than", "default": false},
            { "value": "BTW", "label": "360.admin.operatorMap.between", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        DOUBLE: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "GTE", "label": "360.admin.operatorMap.greater_equal", "default": false},
            { "value": "LTE", "label": "360.admin.operatorMap.less_equal", "default": false},
            { "value": "LT", "label": "360.admin.operatorMap.less_than", "default": false},
            { "value": "GT", "label": "360.admin.operatorMap.greater_than", "default": false},
            { "value": "BTW", "label": "360.admin.operatorMap.between", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        PERCENT: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "GTE", "label": "360.admin.operatorMap.greater_equal", "default": false},
            { "value": "LTE", "label": "360.admin.operatorMap.less_equal", "default": false},
            { "value": "LT", "label": "360.admin.operatorMap.less_than", "default": false},
            { "value": "GT", "label": "360.admin.operatorMap.greater_than", "default": false},
            { "value": "BTW", "label": "360.admin.operatorMap.between", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        PERCENTAGE: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "GTE", "label": "360.admin.operatorMap.greater_equal", "default": false},
            { "value": "LTE", "label": "360.admin.operatorMap.less_equal", "default": false},
            { "value": "LT", "label": "360.admin.operatorMap.less_than", "default": false},
            { "value": "GT", "label": "360.admin.operatorMap.greater_than", "default": false},
            { "value": "BTW", "label": "360.admin.operatorMap.between", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        NUMBER: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "GTE", "label": "360.admin.operatorMap.greater_equal", "default": false},
            { "value": "LTE", "label": "360.admin.operatorMap.less_equal", "default": false},
            { "value": "LT", "label": "360.admin.operatorMap.less_than", "default": false},
            { "value": "GT", "label": "360.admin.operatorMap.greater_than", "default": false},
            { "value": "BTW", "label": "360.admin.operatorMap.between", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        LOOKUP: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": false},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false},
            { "value": "CONTAINS", "label": "360.admin.operatorMap.contains", "default": false},
            { "value": "DOES_NOT_CONTAINS", "label": "360.admin.operatorMap.not_contain", "default": false},
            { "value": "STARTS_WITH", "label": "360.admin.operatorMap.starts_with", "default": false},
            { "value": "ENDS_WITH", "label": "360.admin.operatorMap.ends_with", "default": false},
        ],
        FIELD: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false}
        ],
        WHOID: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": false},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        WHATID: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "IN", "label": "360.admin.operatorMap.in", "default": false},
            { "value": "NOT_IN", "label": "360.admin.operatorMap.not_in", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ],
        JSON: [
            { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": false},
            { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
            { "value": "CONTAINS", "label": "360.admin.operatorMap.contains", "default": true},
            { "value": "DOES_NOT_CONTAINS", "label": "360.admin.operatorMap.not_contain", "default": false},
            { "value": "STARTS_WITH", "label": "360.admin.operatorMap.starts_with", "default": false},
            { "value": "ENDS_WITH", "label": "360.admin.operatorMap.ends_with", "default": false},
            { "value": "IS_NULL", "label": "360.admin.operatorMap.is_null", "default": false},
            { "value": "IS_NOT_NULL", "label": "360.admin.operatorMap.not_null", "default": false}
        ]
    };
}
