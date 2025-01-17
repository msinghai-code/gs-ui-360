export namespace ReportFilterMap {

    export const OperatorMap = {
      "EQUALS": "EQ",
      "NOTEQUAL": "NE",
      "ISNULL": "IS_NULL",
      "ISNOTNULL": "IS_NOT_NULL",
      "GREATERTHANOREQUAL": "GTE",
      "GREATERTHAN": "GT",
      "LESSTHANOREQUAL": "LTE",
      "LESSTHAN": "LT",
      "STARTSWITH": "STARTS_WITH",
      "ENDSWITH": "ENDS_WITH",
      "NOTCONTAIN": "DOES_NOT_CONTAINS",
      "CONTAINS": "CONTAINS"
    };
  
    export const systemToPrimitiveDatatypeFilterableMap = {
      "STRING" : true,
      'INTEGER': true,
      "NUMBER" : true,
      "LONG": true,
      "DOUBLE": true,
      "CURRENCY" : true,
      "TEXT"  : true,
      "PICKLIST" : false,
      "BOOLEAN" : false,
      "RICHTEXTAREA" : false,
      "GSID" : true,
      "DATE" : true,
      "DATETIME" : true,
      "TIMESTAMP" : true,
      "PERCENTAGE" : true,
      "LOOKUP" : true,
      "URL": true,
      "SFDCID": true,
      "MULTISELECTDROPDOWNLIST": false,
      "EMAIL" : true,
      "WHOID" : false,
      "WHATID" : false,
      "CONTEXT" : false,
      "JSON": false
    };
  
    export const systemToPrimitiveDatatypeSortableMap = {
      "STRING" : true,
      "NUMBER" : true,
      "INTEGER" : true,
      "LONG": true,
      "DOUBLE": true,
      "CURRENCY" : true,
      "TEXT"  : true,
      "PICKLIST" : true,
      "BOOLEAN" : true,
      "TEXTAREA" : false,
      "RICHTEXTAREA" : false,
      "GSID" : true,
      "DATE" : true,
      "DATETIME" : true,
      "TIMESTAMP" : true,
      "PERCENTAGE" : true,
      "LOOKUP" : true,
      "URL": true,
      "SFDCID": true,
      "MULTISELECTDROPDOWNLIST": false,
      "EMAIL" : true,
      "WHOID" : false,
      "WHATID" : false,
      "CONTEXT" : false,
      "JSON": false
    };
  
    // CY = Calendar year
    
      
    export const calenderDateLiterals = [
      {
        "value": null,
        "label": "360.admin.operatorMap.calender_year",
        "options": [
          { "value": "CURRENT_CY", "label": "360.admin.operatorMap.this_yr" },
          { "value": "PREVIOUS_CY", "label": "360.admin.operatorMap.last_yr" },
          { "value": "CURRENT_AND_PREVIOUS_N_YEARS", "label": "360.admin.operatorMap.curr_pre_yr" },
          { "value": "NEXT_CY", "label": "360.admin.operatorMap.next_yr" },
          { "value": "CURRENT_AND_NEXT_N_YEARS", "label": "360.admin.operatorMap.curr_next_nyr" },
          { "value": "LAST_N_YEARS", "label": "360.admin.operatorMap.last_n_yr" },
          { "value": "NEXT_N_YEARS", "label": "360.admin.operatorMap.next_n_yr" }
        ]
      },
  
      {
        "value": null,
        "label": "360.admin.operatorMap.calender_quarter",
        "options": [
          { "value": "CURRENT_CYQ", "label": "360.admin.operatorMap.this_quater" },
          { "value": "PREVIOUS_CYQ", "label": "360.admin.operatorMap.last_quater" },
          { "value": "CURRENT_AND_PREVIOUS_N_QUARTERS", "label": "360.admin.operatorMap.curr_pre_quater" },
          { "value": "NEXT_CYQ", "label": "360.admin.operatorMap.next_quater" },
          { "value": "CURRENT_AND_NEXT_N_QUARTERS", "label": "360.admin.operatorMap.curr_next_nquater" },
          { "value": "LAST_N_QUARTERS", "label": "360.admin.operatorMap.last_n_quater" },
          { "value": "NEXT_N_QUARTERS", "label": "360.admin.operatorMap.next_n_quater" }
        ]
      },
  
      {
        "value": null,
        "label": "360.admin.operatorMap.calender_month",
        "options": [
          { "value": "THIS_MONTH", "label": "360.admin.operatorMap.this_month" },
          { "value": "PREVIOUS_MONTH", "label": "360.admin.operatorMap.last_month" },
          { "value": "CURRENT_AND_PREVIOUS_N_MONTHS", "label": "360.admin.operatorMap.curr_pre_nmonth" },
          { "value": "NEXT_MONTH", "label": "360.admin.operatorMap.next_month" },
          { "value": "CURRENT_AND_NEXT_N_MONTHS", "label": "360.admin.operatorMap.curr_next_nmonth" },
          { "value": "LAST_N_MONTHS", "label": "360.admin.operatorMap.last_n_months" },
          { "value": "NEXT_N_MONTHS", "label": "360.admin.operatorMap.next_n_months" }
        ]
      },
      
      {
        "value": null,
        "label": "360.admin.operatorMap.calender_week",
        "options": [
          { "value": "THIS_WEEK", "label": "360.admin.operatorMap.this_week" },
          { "value": "LAST_WEEK", "label": "360.admin.operatorMap.last_week" },
          { "value": "CURRENT_AND_PREVIOUS_N_WEEKS", "label": "360.admin.operatorMap.curr_pre_week" },
          { "value": "NEXT_WEEK", "label": "360.admin.operatorMap.next_week" },
          { "value": "CURRENT_AND_NEXT_N_WEEKS", "label": "360.admin.operatorMap.curr_next_week" },
          { "value": "LAST_N_WEEKS", "label": "360.admin.operatorMap.last_n_week" },
          { "value": "NEXT_N_WEEKS", "label": "360.admin.operatorMap.next_n_week" }
        ]
      },
      
      {
        "value": null,
        "label": "360.admin.operatorMap.calender_days",
        "options": [
          { "value": "TODAY", "label": "360.admin.operatorMap.today" },
          { "value": "YESTERDAY", "label": "360.admin.operatorMap.yesterday" },
          { "value": "TOMORROW", "label": "360.admin.operatorMap.tomorrow" },
          { "value": "LAST_N_DAYS", "label": "360.admin.operatorMap.last_n_days" },
          { "value": "NEXT_N_DAYS", "label": "360.admin.operatorMap.next_n_days" }
        ]
      },
    ];
  
    // FY = Fiscal Date Literals
    
    export const fiscalDateLiterals = [
      {
        "value": "FISCAL_QUARTER",
        "label": "360.admin.operatorMap.fiscal_quater",
        "options": [
          { "value": "CURRENT_FYQ", "label": "360.admin.operatorMap.this_fiscal_quater" },
          { "value": "PREVIOUS_FYQ", "label": "360.admin.operatorMap.last_fiscal_quater" },
          { "value": "CURRENT_AND_PREVIOUS_N_FISCAL_QUARTERS", "label": "360.admin.operatorMap.curr_pre_fiscal_quater" },
          { "value": "NEXT_FYQ", "label": "360.admin.operatorMap.next_fiscal_quater" },
          { "value": "CURRENT_AND_NEXT_N_FISCAL_QUARTERS", "label": "360.admin.operatorMap.curr_next_fiscal_quater" },
          { "value": "LAST_N_FISCAL_QUARTERS", "label": "360.admin.operatorMap.last_n_fiscal_quater" },
          { "value": "NEXT_N_FISCAL_QUARTERS", "label": "360.admin.operatorMap.next_n_fiscal_quater" }
        ]
      },
      {
        "value": "FISCAL_YEAR",
        "label": "360.admin.operatorMap.fiscal_yr",
        
        "options": [
          { "value": "CURRENT_FY", "label": "360.admin.operatorMap.this_fiscal_yr" },
          { "value": "PREVIOUS_FY", "label": "360.admin.operatorMap.last_fiscal_yr" },
          { "value": "CURRENT_AND_PREVIOUS_N_FISCAL_YEARS", "label": "360.admin.operatorMap.curr_pre_fiscal_yr" },
          { "value": "NEXT_FY", "label": "360.admin.operatorMap.next_fiscal_yr" },
          { "value": "CURRENT_AND_NEXT_N_FISCAL_YEARS", "label": "360.admin.operatorMap.curr_next_fiscal_yr" },
          { "value": "LAST_N_FISCAL_YEARS", "label": "360.admin.operatorMap.last_n_fiscal_yr" },
          { "value": "NEXT_N_FISCAL_YEARS", "label": "360.admin.operatorMap.next_n_fiscal_yr" }
        ]
      }
    ];
  
    export const ENABLE_SUMMARIZE_BY_COLUMN_FILTER = ['DAY'];
  
    /**
     * Finalized datatype vs operator map.
     */
  
    export const newOperatorMap = {
      STRING: [
        { "value": "EQ", "label": "360.admin.operatorMap.equals", "default": true},
        { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
        { "value": "CONTAINS", "label": "360.admin.operatorMap.contains", "default": false},
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
        { "value": "NE", "label": "360.admin.operatorMap.not_equal", "default": false},
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
  