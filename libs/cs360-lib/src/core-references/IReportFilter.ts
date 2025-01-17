export interface ReportFilterCondition {
    comparisonOperator: string;
    filterAlias: string;
    filterValue?: any;
    leftOperand: any;
    rightOperandType: string;
    locked?: boolean;
    filterField?: any;
    includeNulls?: boolean;
  };
  
  export interface ReportFilter {
    conditions?: ReportFilterCondition[];
    expression?: string;
  };