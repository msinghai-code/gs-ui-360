/**
 * created by rpal
 */
import { Inject } from "@angular/core";
import {
    GridPreProcessor,
    IDataProcessorOptions
} from "@gs/report/report-viewer";
import {getColClass, getDefaultCellFilter} from "@gs/gdk/grid";
import { GsMappingRendererComponent } from "../gs-mapping-renderer.component";
import { CONTEXT_INFO, ICONTEXT_INFO, isMini360 } from '@gs/cs360-lib/src/common';
import {ReportGSField, ReportUtils, AppInjector} from "@gs/report/utils";
import { HealthScoreRendererComponent } from "@gs/cs360-lib/src/portfolio-copy";
import { hasNullAsValue } from '@gs/cs360-lib/src/core-references';
import {isEmpty} from 'lodash';
import { NzI18nService } from "@gs/ng-horizon/i18n";
import { ReportViewerSettings } from "@gs/report/pojos";
import { escape } from "lodash";
import {EnvironmentService} from "@gs/gdk/services/environment";
import {RTCellRendererComponent} from "../../rtecellrenderer/gs-rt-cell-renderer/gs-rt-cell-renderer.component";
import {ValueFormatterParams} from "@ag-grid-community/core";

// TODO: Need to re consider this local interface. Added to remove core dependency.
interface IReportGSField extends ReportGSField {
    [key:string]: any;
}

export class RelationshipGridProcessor extends GridPreProcessor {

    constructor(props: IDataProcessorOptions, public ctx: ICONTEXT_INFO, i18nService : NzI18nService, @Inject("envService") private _env: EnvironmentService) {
        super(props);
    }

    public buildColumns(column: IReportGSField, index: number, options?: ReportViewerSettings) {
        let copyColumn = column;
        const derivedColDatatype: string = this.getFieldDerivedDatatype(copyColumn);
        let kColumn = super.buildColumns(column, index, options);
        kColumn.field = column.itemId as any;
        kColumn.label = kColumn.headerName;
        kColumn.sort = column.sort;
        kColumn.colId = column.itemId as any;
        kColumn.hidden = column.hidden;
         kColumn.sortable = (derivedColDatatype !== 'RICHTEXTAREA' ) ? true : false
        const GS = this._env.gsObject;
        if(GS.featureFlags['CR360_TEXT_DATA_DECODING_DONE']){
            kColumn.valueFormatter = derivedColDatatype === 'RICHTEXTAREA' ? (params) => params.value.fv : ReportUtils.valueFormatter({dataType: derivedColDatatype}, {honorNulls: false});
        } else {
            kColumn.valueFormatter = derivedColDatatype === 'RICHTEXTAREA' ? (params) => decodeURIComponent(params.value.fv) : ReportUtils.valueFormatter({dataType: derivedColDatatype}, {honorNulls: false});
        }
        const cellRenderer = this.setCellRenderer(column, derivedColDatatype, false);
        if(!isEmpty(cellRenderer)) {
            kColumn = {...kColumn, ...cellRenderer};
        }
        kColumn.headerTooltip = kColumn.headerName;
        kColumn.tooltipValueGetter = column.fieldName === "CurrentScore" || column.fieldName === "PreviousScore" ? params => "" : this.getTooltipValueGetter(kColumn);
        kColumn.disabled = column.fieldName === "Name" && !column.fieldPath;
        kColumn.isNameColumn = column.fieldName === "Name" && !column.fieldPath;
        const customCellRenderer = this.setCustomCellRenderer(column);
        if(!isEmpty(customCellRenderer)) {
            delete kColumn.cellRendererSelector;
            kColumn = {...kColumn, ...customCellRenderer};
        }
        if(this.isRelFieldFilterable(column) && !["CurrentScore", "PreviousScore"].includes(column.fieldName)) {
            kColumn.cellClass = getColClass(derivedColDatatype);
            kColumn.filter = getDefaultCellFilter(derivedColDatatype) || false;
            const floatingFilter = this.setFloatingFilterComponentBySource(derivedColDatatype, column);
            if(!isEmpty(floatingFilter)) {
                kColumn = {...kColumn, ...floatingFilter};
            }
        } else {
            kColumn.filter = false;
        }
        // Set Custom Client sorting
        if(column.fieldName === "CurrentScore" || column.fieldName === "PreviousScore"){
            this.setCustomSorting(kColumn, 'SCORE');
        } else {
            this.setCustomSorting(kColumn, derivedColDatatype);
        }
        if(isMini360(this.ctx)) {
            kColumn.width = column.width || 150;
            kColumn.properties = column.properties || {};
            kColumn.properties.width = column.width || 150;
        }

        return kColumn;
    }

    protected isValidHTMLTagFromString(value: string, tags: any) {
        const doc = new DOMParser().parseFromString(value, 'text/html');
        return doc.body.querySelectorAll(tags);
    }

    protected getTooltipValueGetter(kColumn: any) {
    const RESTRICTED_FIELD_FOR_TOOLTIPS = ["RICHTEXTAREA", "TEXTAREA"];
    const ALLOWED_HTML_TAG_FOR_STRING_DTS = ['a', 'bold', 'ol', 'ul', 'italic', 'img'];
    let toolTipValueGetter;
    if(RESTRICTED_FIELD_FOR_TOOLTIPS.indexOf(kColumn.dataType) === -1) {
        toolTipValueGetter = (params) => {
        // Show only innerText for the HTML strings in tooltips.
        const nodesList = this.isValidHTMLTagFromString(params.value ? params.value.fv : '', ALLOWED_HTML_TAG_FOR_STRING_DTS.join(', '));
        if(nodesList.length) {
            return params.value ? params.value.fv: "";
        }
        return (params.value && params.value.fv) || "";
        }
    }
    else {
        const GS = this._env.gsObject;
        if(GS.featureFlags['CR360_TEXT_DATA_DECODING_DONE']){
            toolTipValueGetter = (params)=> params.value && params.value.fv ? params.value.fv:  "";
        } else {
            toolTipValueGetter = (params)=> params.value && params.value.fv ? decodeURIComponent((params.value.fv)).replace(/<\/?[^>]+>/gi, " ").replace(/&amp;/g, '&').replace(/&nbsp;/g, ''):  "";
        }
    }
    return toolTipValueGetter;
    }

    private setCustomCellRenderer(column: any) {
        if(["CurrentScore", "PreviousScore"].includes(column.fieldName)) {
            return {
                cellRendererFramework: HealthScoreRendererComponent
            }
        } else if(column.fieldName === "Name" && column.objectName === "relationship") {
            if((!this.ctx.isNativeWidget)) {
                return {
                    cellRendererFramework: GsMappingRendererComponent,
                    properties: {reference: "GS_RELATIONSHIP_NAME"},
                    cellRendererParams: {
                        disableHyperlinkRedirection: false
                    }
                }
            } else {
                return {
                    cellRenderer: (params) => {
                        return `<span class="rel_name">` + params.valueFormatted + `</span>`
                    }
                }
            }
        } else if (column.dataType === "STRING" && column.meta && column.meta.mappings){
            return {
                cellRenderer: (params) => {
                    return `<span class="name">` + escape(params.valueFormatted) + `</span>`
                }
            }
        } else if (column.dataType === "STRING" && column.meta && !column.meta.mappings){
            return {
                cellRenderer: (params) => {
                    const html = params.valueFormatted;
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const anchorElement = doc.querySelector('a');
                    if (anchorElement) {
                    anchorElement.setAttribute('target', '_blank');
                    const modifiedValue = new XMLSerializer().serializeToString(doc);
                    return `<span class="name">` + modifiedValue + `</span>`
                    } else {
                        return `<span class="name">` + params.valueFormatted + `</span>`
                    }
                }
            }
        }
    }

    private setCustomSorting(kColumn, derivedColDatatype) {
        switch (derivedColDatatype) {
            case 'STRING':
            case 'URL':
            case 'BOOLEAN':
            case 'PICKLIST':
            case 'MULTIPICKLIST':
            case 'MULTISELECTDROPDOWNLIST':
                kColumn.comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
                    if (valueA && valueA.fv == valueB && valueB.fv) return 0;
                    return (valueA.fv > valueB.fv) ? 1 : -1;
                }
                break;
            case 'NUMBER':
            case 'CURRENCY':
            case 'PERCENTAGE':
                kColumn.comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
                    console.log('values', valueA, valueB)
                    return (valueA && valueA.k || 0) - (valueB && valueB.k || 0);
                };
                break;
            case 'DATE':
            case 'DATETIME':
                kColumn.comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
                    let date1Number = valueA.fv && new Date(valueA.fv).getTime();
                    let date2Number = valueB.fv && new Date(valueB.fv).getTime();

                    if (date1Number == null && date2Number == null) {
                        return 0;
                    }

                    if (date1Number == null) {
                        return -1;
                    } else if (date2Number == null) {
                        return 1;
                    }

                    return date1Number - date2Number;
                };
                break;
            case "SCORE":
                kColumn.comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
                    return ((valueB && valueB.properties &&valueB.properties.score) || 0) - (valueA && valueA.properties && valueA.properties.score || 0);
                };
                break;
        }
    }

    public getDefaultPrefixByType(): string {
        return null;
    }

    private isRelFieldFilterable(column: any): boolean {
        return ["PICKLIST", "BOOLEAN", "MULTISELECTDROPDOWNLIST", "WHOID", "WHATID", "CONTEXT","RICHTEXTAREA"].indexOf(column.dataType.toUpperCase()) === -1;
    }

    public getTranslatedLabelOperator(filterOperator) {
        const translationService = AppInjector.get(NzI18nService)
        return filterOperator.map(type => {
            return {...type,
                label: this.translateLabel(type.label, translationService)
            }
        });
    }

    public setCellRenderer(column: IReportGSField, derivedDatatype: string = 'string', disableHyperlinkRedirection = false): any {
        switch (derivedDatatype.toUpperCase()) {
            case 'RICHTEXTAREA':
            case 'TEXTAREA':
                return {
                    // Auto Row Height for Rich text area content.
                    ...this.setAutoHeight(false),
                    cellRendererFramework: RTCellRendererComponent,
                    cellRendererParams: { showActions: true }
                };
            case 'URL':
                return {
                    /**
                     * In case of pinned rows, cellRenderer doesn't have value in params object
                     * Use data instead.
                     * @param params
                     */
                    'cellRenderer': (params: ValueFormatterParams) => {
                        if(hasNullAsValue(params)) {
                            return ReportUtils.getCellTextByOptions(params, {honorNulls: true});
                        }
                        let url: string = !!params.value ? params.value.fv: '';
                        let prefixedUrl: string = url;
                        // Fallback for urls if they dont have http/https verbs prefixed.
                        if(!!url && !url.match(/^[a-zA-Z]+:\/\//)) {
                            prefixedUrl = `https://${url}`;
                        }
                        return !!url ? `<a href="${prefixedUrl}" target="_blank">${url}</a>` : '';
                    }
                };
            default: return null;
        }
    }

    public getColumns(columns?: any[], options?: ReportViewerSettings) {
        this.columns = [];
        const reportGSFields: any[] = columns || this.fields;
        if(reportGSFields && reportGSFields.length) {
            for(let i=0; i<reportGSFields.length; i++){
                const kColumn: any = this.buildColumns(reportGSFields[i], i, options);
                if(!kColumn.hidden) {
                    kColumn.minWidth = isMini360(this.ctx) ? 150 : 200;
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

}
