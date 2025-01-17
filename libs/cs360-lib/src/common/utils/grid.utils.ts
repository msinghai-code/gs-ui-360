import {ValueFormatterParams} from '@ag-grid-community/core';
import { isEmpty } from 'lodash';
import { RtCellRendererComponent, MappingRendererComponent } from "@gs/gdk/grid";

export const ALLOWED_HTML_TAG_FOR_STRING_DTS = ['a', 'bold', 'ol', 'ul', 'italic', 'img'];

export function setCellRenderer(column: any, derivedDatatype: string = 'string', disableHyperlinkRedirection = false): any {
    switch (derivedDatatype.toUpperCase()) {
        case 'URL':
        return {
            /**
             * In case of pinned rows, cellRenderer doesn't have value in params object
             * Use data instead.
             * @param params
             */
            'cellRenderer': (params: ValueFormatterParams) => {
                if(params.value.k === null) {
                    return "";
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
        case 'STRING':
            /**
             * fieldHyperLink: {reference: "GS_COMPANY_NAME"}
             * disableHyperlinkRedirection: To Disable link redirection for cases like C360 in external report/dashboard
             */
            if(!isEmpty(column.fieldHyperLink)) {
                return {
                    cellRendererFramework: MappingRendererComponent,
                    properties: column.fieldHyperLink,
                    'cellRendererParams': {
                        disableHyperlinkRedirection
                    }
                };
            } else {
                return {
                    cellRendererSelector: (params: ValueFormatterParams) => {
                        if(!!params.value && !!params.value.fv && column.meta && !column.meta.mappings && column.fieldName !== "Name") {
                            const nodesList = isValidHTMLTagFromString(params.value.fv, ALLOWED_HTML_TAG_FOR_STRING_DTS.join(', '));
                            if(nodesList.length) {
                                return {
                                component: 'gsStringTagRenderer'
                                }
                            } else {
                                return null;
                            }
                        } else {
                            return null;
                        }
                    }
                }
            }
        break;
        case 'RICHTEXTAREA':
        case 'TEXTAREA':
        return {
            // Auto Row Height for Rich text area content.
            ...setAutoHeight(false),
            cellRendererFramework: RtCellRendererComponent,
            cellRendererParams: { showActions: true }
        };
        default: return null;
    }
}

export function setAutoHeight(autoHeight: boolean = false) {
    if(autoHeight) {
      return {
        autoHeight: true,
        cellStyle: { 'white-space': 'normal', 'word-wrap': 'break-word' }
      };
    }
}

export function isValidHTMLTagFromString(value: string, tags: any) {
    const doc = new DOMParser().parseFromString(value, 'text/html');
    return doc.body.querySelectorAll(tags);
}
