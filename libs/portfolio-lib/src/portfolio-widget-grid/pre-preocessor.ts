/**
 * Created by rpal on 2019-12-05
 */
import { NzI18nService } from "@gs/ng-horizon/i18n"
import {
    TextFloatingFilterComponent,
    NumberFloatingFilterComponent,
    DateFloatingFilterComponent,
    BooleanFloatingFilterComponent
} from "@gs/gdk/grid";
import {FloatingFilterUtils} from "../utils/FloatingFilterUtils";
import {ValueFormatterParams} from "@ag-grid-community/core";
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import {
    GridState,
    PortfolioGSField,
    ReportViewerSettings
} from "../pojos/portfolio-interfaces";
import {FieldUtils} from "../utils/FieldUtils";
import {GridUtils} from "../utils/GridUtils";
import {FilterUtils} from "../utils/FilterUtils";

export const BOOLEAN_OPTIONS = [
    {label: "360.admin.boolean_options.None", value: null, default: true},
    {label: "360.admin.boolean_options.True", value: true},
    {label: "360.admin.boolean_options.False", value: false},
    {label: "360.admin.boolean_options.null", value: 'IS_NULL'},
    {label: "360.admin.boolean_options.notNull", value: 'IS_NOT_NULL'}
];

export const stripHtml = (html: string) => {
    // Create a new div element
    let temporalDivElement = document.createElement("div");
    // Set the HTML content with the provided html
    temporalDivElement.innerHTML = html;
    // Retrieve the text property of the element (cross-browser support)
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
}

export class PortfolioGridProcessor {


    public data: any;

    public fields: PortfolioGSField[];

    public columns: any[];

    public formatOptions: any = {};

    public meta: any;

    private gridState: GridState;

    i18nService: NzI18nService;

    constructor(props, i18nService) {
        this.data = props.data;
        this.fields = props.columns;
        this.formatOptions = props.formatOptions;
        this.meta = props.meta;
        this.gridState = props.gridState;
        this.i18nService = i18nService;
    }

    // @ts-ignore
    public setFloatingFilterComponent(derivedDatatype: string, options: any = {}, sourceDetails?: any, field?: any) {
        let filterOperatorMap: any[];
        switch (derivedDatatype.toUpperCase()) {
            case 'STRING':
            case 'TEXT':
                filterOperatorMap = FloatingFilterUtils.getFloatingFilterOptionByType('STRING', options);
                filterOperatorMap = this.getTranslatedLabelOperator(filterOperatorMap);
                return {
                    floatingFilterComponent: TextFloatingFilterComponent,
                    floatingFilterComponentParams: {
                        suppressFilterButton: true,
                        filterOptions: filterOperatorMap
                    },
                    filterParams: {
                        // [IMP. NOTE] This has been done to defer the default filtering of ag-grid.
                        filterChangedCallback: () => {},
                        filterOptions: FilterUtils.getFilterOptionsDef(filterOperatorMap)
                    }
                };
            case 'NUMBER':
            case 'INTEGER':
            case 'CURRENCY':
            case 'PERCENTAGE':
            case 'DOUBLE':
            case 'LONG':
                filterOperatorMap = FloatingFilterUtils.getFloatingFilterOptionByType('NUMBER', options);
                filterOperatorMap = this.getTranslatedLabelOperator(filterOperatorMap);
                return {
                    floatingFilterComponent: NumberFloatingFilterComponent,
                    floatingFilterComponentParams: {
                        suppressFilterButton: true,
                        filterOptions: filterOperatorMap
                    },
                    filterParams: {
                        // [IMP. NOTE] This has been done to defer the default filtering of ag-grid.
                        filterChangedCallback: () => {},
                        filterOptions: FilterUtils.getFilterOptionsDef(filterOperatorMap)
                    }
                };
            case 'DATE':
            case 'DATETIME':
                filterOperatorMap = FloatingFilterUtils.getFloatingFilterOptionByType('DATE', options);
                filterOperatorMap = this.getTranslatedLabelOperator(filterOperatorMap);
                return {
                    floatingFilterComponent: DateFloatingFilterComponent,
                    floatingFilterComponentParams: {
                        suppressFilterButton: true,
                        filterOptions: filterOperatorMap
                    },
                    filterParams: {
                        // [IMP. NOTE] This has been done to defer the default filtering of ag-grid.
                        filterChangedCallback: () => {},
                        filterOptions: FilterUtils.getFilterOptionsDef(filterOperatorMap)
                    }
                };
            case 'PICKLIST':
            case 'MULTISELECTDROPDOWNLIST':
                // filterOperatorMap = FloatingFilterUtils.getFloatingFilterOptionByType('PICKLIST', options);
                // filterOperatorMap = this.getTranslatedLabelOperator(filterOperatorMap);
                // return {
                //     floatingFilterComponent: DropdownFloatingFilterComponent,
                //     floatingFilterComponentParams: {
                //         suppressFilterButton: true,
                //         filterOperatorOptions: filterOperatorMap
                //     },
                //     filterParams: {
                //         // [IMP. NOTE] This has been done to defer the default filtering of ag-grid.
                //         // filterChangedCallback: () => {},
                //         field: {...field} || {},
                //         sourceDetail: sourceDetails,
                //         treeOptions: this.treeOptions,
                //         filterOptions: FilterUtils.getFilterOptionsDef(filterOperatorMap),
                //         hostInfo : this.meta.hostInfo
                //     }
                // };
                return;
            case 'BOOLEAN':
                const option = BOOLEAN_OPTIONS.slice(1);
                return {
                    floatingFilterComponent: BooleanFloatingFilterComponent,
                    floatingFilterComponentParams: {
                        suppressFilterButton: true,
                        filterOperatorOptions: BOOLEAN_OPTIONS
                    },
                    filterParams: {
                        // [IMP. NOTE] This has been done to defer the default filtering of ag-grid.
                        // filterChangedCallback: () => {},
                        filterOptions: FilterUtils.getFilterOptionsDef(option)
                    }
                };
            default:
                filterOperatorMap = FloatingFilterUtils.getFloatingFilterOptionByType(derivedDatatype, options);
                filterOperatorMap = this.getTranslatedLabelOperator(filterOperatorMap);
                return {
                    floatingFilterComponent: TextFloatingFilterComponent,
                    floatingFilterComponentParams: {
                        suppressFilterButton: true,
                        filterOptions: filterOperatorMap
                    },
                    filterParams: {
                        // [IMP. NOTE] This has been done to defer the default filtering of ag-grid.
                        filterChangedCallback: () => {},
                        filterOptions: FilterUtils.getFilterOptionsDef(filterOperatorMap)
                    }
                };
        }
    }

    public getTranslatedLabelOperator(filterOperator) {
        return filterOperator.map(type => {
            return {
                ...type,
                label: this.i18nService.translate(type.label)
            }
        });
    }

    public getColumns(columns?: any[], options?: ReportViewerSettings) {
        this.columns = [];
        const reportGSFields: any[] = columns || this.fields;
        if(reportGSFields && reportGSFields.length) {
            for(let i=0; i<reportGSFields.length; i++){
                const kColumn: any = this.buildColumns(reportGSFields[i], i, options);
                if(!kColumn.hidden) {
                    if(reportGSFields[i].fields && reportGSFields[i].fields.length > 0){
                        kColumn.columns = this.getColumns(reportGSFields[i].fields, options);
                    }

                    this.columns.push(kColumn);
                }
            }

            return this.columns;
        } else {

        }
    }

    public buildColumns(column: PortfolioGSField, index: number, options?: ReportViewerSettings) {
        let kColumn: any = {};
        const derivedColDatatype: string = this.getFieldDerivedDatatype(column);
        kColumn.field = column.fieldAlias;
        kColumn.headerName = column.displayName || column.label || column.fieldName || column.fieldAlias;
        kColumn.minWidth = 200;
        kColumn.lockPosition = this.lockColumn(index, options);
        kColumn.hide = column.hidden || false;
        kColumn.dataType = derivedColDatatype;
        kColumn.colId = kColumn.field;
        kColumn.sortable = column.sortable;
        kColumn.menuTabs = [];
        kColumn = this.setGridFilters(column, kColumn, derivedColDatatype);
        kColumn.cellEditor = this.getDefaultCellEditor(derivedColDatatype);
        if (!!column.sortable) {
            kColumn.sortingOrder = GridUtils.getDefaultSortingOrder(column as any);
        }
        if (column.rowGrouped) {
            kColumn.rowGroup = column.rowGrouped;
        }
        if (!!options && options.freezeFirstColumn && index === 0) { // todo: pin columns based on position
            kColumn.pinned = 'left';
        }
        if(column.rowGrouped) {
            kColumn.aggFunc = 'count';
        }
        if(derivedColDatatype === 'NUMBER' || derivedColDatatype === 'CURRENCY' || derivedColDatatype === 'PERCENTAGE') {
            kColumn.format = column.scale;
        } else if(derivedColDatatype === 'DATE') {
            kColumn.format = FieldUtils.isFieldDateType(column) ?  this.formatOptions && this.formatOptions.locale && this.formatOptions.locale.dateFormat : column.scale;
        } else if(derivedColDatatype === 'DATETIME') {
            kColumn.format = FieldUtils.isFieldDateType(column) ?  this.formatOptions && this.formatOptions.locale && this.formatOptions.locale.dateTimeFormat : column.scale;
        }
        kColumn.valueFormatter = this.valueFormatter(kColumn.format, derivedColDatatype, this.formColumnMetaInfo(column));
        kColumn.comparator = () => false; // to disable grid default client sort
        kColumn.tooltip= (params) => (params.valueFormatted ? params.valueFormatted : params.value); // This will show valueFormatted if is present, if no just show the value.

        delete kColumn.format;
        return kColumn;
    }

    /* Allow to override extending classes */
    protected isFieldFilterable(column) {
        return FilterUtils.isFieldFilterable(column);
    }

    protected setGridFilters(column, kColumn, derivedColDatatype) {
        if (this.isFieldFilterable(column)) {
            kColumn.cellClass = this.getColClass(derivedColDatatype);
            kColumn.filter = this.getDefaultCellFilter(derivedColDatatype) || false;
            const floatingFilter = this.setFloatingFilterComponent(derivedColDatatype, column, {});
            if(!isEmpty(floatingFilter)) {
                kColumn = {...kColumn, ...floatingFilter};
            }
        }
        return kColumn;
    }

    getColClass(dataType: string, existingClass = '') {
        let colClass = '';
        switch (dataType.toUpperCase()) {
            case 'NUMERIC':
            case 'NUMBER':
            case 'CURRENCY':
            case 'PERCENTAGE':
            case 'INTEGER':
            case 'DOUBLE':
            case 'LONG':
                colClass = 'dt-number';
                break;
            case 'DATE':
            case 'DATETIME':
                colClass = 'dt-date';
                break;
            case 'BOOLEAN':
                colClass = 'dt-boolean';
                break;
            default:
                colClass = 'dt-text';
        }

        return existingClass ? existingClass + ' ' + colClass : colClass;
    }

    getDefaultCellFilter(dataType: string) {
        let filterType = 'agTextColumnFilter';
        switch (dataType && dataType.toUpperCase()) {
            case 'NUMERIC':
            case 'NUMBER':
            case 'CURRENCY':
            case 'PERCENTAGE':
            case 'INTEGER':
            case 'DOUBLE':
            case 'LONG':
                filterType = 'agNumberColumnFilter';
                break;
            case 'DATE':
            case 'DATETIME':
                filterType = 'agDateColumnFilter';
                break;
            case 'PICKLIST':
            case 'BOOLEAN':
                filterType = 'agSetColumnFilter';
                break;
            default:
                filterType = 'agTextColumnFilter';
        }
        return filterType;
    }

    getDefaultCellEditor(dataType ?: any) {
        let template: any;
        switch (dataType && dataType.toUpperCase()) {
            case 'NUMBER':
            case 'CURRENCY':
            case 'INTEGER':
            case 'DOUBLE':
            case 'LONG':
            case 'PERCENTAGE': template = 'agNumberEditor';
                break;
            case 'BOOLEAN': template = 'agBooleanEditor';
                break;
            case 'DATE':
            case 'DATETIME': template = 'agDateEditor';
                break;
            case 'PICKLIST':
            case 'MULTIPICKLIST': template = 'agTextCellEditor';
                break;
            default: template = 'agTextCellEditor';
        }
        return template;
    }

    public lockColumn(colIndex: number, options: ReportViewerSettings): boolean {
        if(!!options && options.freezeFirstColumn) {
            return colIndex === 0;
        } else {
            return false;
        }
    }

    private formColumnMetaInfo(field: PortfolioGSField): any {
        return {
            filterable: !!field.filterable ? this.getFilterConfig(field): false,
            editable: false,
            sortable: !!field.sortable ? this.getSortConfig(field) : {allowUnsort: false},
            groupable: !!field.groupable ? this.getGroupConfig(field): false,
            hyperlink: false,
            formatOptions: {
                prefix: this.meta && this.meta[field.fieldAlias] && !isNil(this.meta[field.fieldAlias].prefix) ? this.meta[field.fieldAlias].prefix: this.getDefaultPrefixByType(field),
                suffix: this.meta && this.meta[field.fieldAlias] && !isNil(this.meta[field.fieldAlias].suffix) ? this.meta[field.fieldAlias].suffix: this.getDefaultSuffixByType(field)
            }
        };
    }

    public getDefaultPrefixByType(field: PortfolioGSField): string {
        const dataType: string = field.dataType.toUpperCase();
        switch (dataType) {
            case 'CURRENCY':
                return this.formatOptions.currency.symbol;
            default:
                return null;
        }
    }

    public getDefaultSuffixByType(field: PortfolioGSField): string {
        const dataType: string = field.dataType.toUpperCase();
        switch (dataType) {
            case 'PERCENTAGE':
                return '%';
            default:
                return null;
        }
    }

    private getSortConfig(field: PortfolioGSField) {
        return {
            allowUnsort: false,
            initialDirection: GridUtils.getDefaultSortOrder(field as any)
        };
    }

    private getFilterConfig(field: PortfolioGSField) {
        return field.filterable;
    }

    private getGroupConfig(field: PortfolioGSField) {
        return field.groupable;
    }

    public setPaginatorScale(options: any) {
        return {
            fromRecord: options.recordCount > 0 ? (options.currentPageNum - 1) * options.currentPageSize + 1: 0,
            toRecord: ((options.currentPageNum - 1) * options.currentPageSize) + options.recordCount
        };
    }

    private valueFormatter(format: any, datatype: string, columnOptions: any) {
        return (params: ValueFormatterParams) => {
            if (!params.value || !params.value.fv) {
                return '---';
            }
            return params.value.fv;
        };
    }

    public getReportGSFilterField(filterItem: any) {
        const fields: any[] = this.getFields();
        return fields.find((field: PortfolioGSField) => {
            return field.fieldAlias === filterItem.field;
        });
    }

    public setGridState(state: any) {
        this.gridState = {...this.gridState, ...state};
    }

    public getFields(): PortfolioGSField[] {
        return this.fields;
    }

    public getGridState() {
        return this.gridState;
    }

    protected getFieldDerivedDatatype(column) {
        return FieldUtils.getFieldDerivedDatatype(column).toUpperCase();
    }

    public getOrderByFields(event) {
        const orderByFields = [];
        const fields = this.getFields();
        event.forEach((sortCol: any) => {
            const sortField: any = fields.find((field: PortfolioGSField) => {
                return field.fieldAlias === sortCol.colId;
            });
            orderByFields.push({
                ...sortField,
                orderByInfo: {order: sortCol.sort.toUpperCase()}
            });
        });

        return orderByFields;
    }

}
