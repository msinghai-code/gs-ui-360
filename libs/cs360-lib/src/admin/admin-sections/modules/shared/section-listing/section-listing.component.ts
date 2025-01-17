import {Component, Inject, Input, OnInit, Pipe, PipeTransform} from '@angular/core';
import { FormControl } from '@angular/forms';
import { findPath } from "@gs/gdk/utils/field";
import { StateAction } from '@gs/gdk/core';
import { path2FieldInfo } from '@gs/gdk/utils/field';
import { Section, SectionCategory, SectionListOptions } from './section-listing.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { find, cloneDeep } from 'lodash';
import { SummaryWidget, WidgetCategoryType, WidgetItemSubType, WidgetItemType } from '@gs/cs360-lib/src/common';
import { LayoutSectionScope } from '../../../../layout-configuration/layout-upsert/layout-upsert.constants';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
// import { PageContext } from '@gs/cs360-lib/src/common';
import { generateKey } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { EnvironmentService } from '@gs/gdk/services/environment';

@Component({
    selector: 'gs-section-listing',
    templateUrl: './section-listing.component.html',
    styleUrls: ['./section-listing.component.scss']
})
export class SectionListingComponent implements OnInit {

    @Input() sectionCategoryList: SectionCategory[];
    @Input() isLoading: boolean = true;
    @Input() options: SectionListOptions;
    @Input() configuredSections: SummaryWidget[] | Section[];
    @Input() isMaxLimitExceed: boolean = false;

    searchInput = new FormControl();
    searchTerm: string;
    listReportsByAssociation = false;
    summaryTooltip = this.i18nService.translate('360.admin.section_listing.maxSummaryWidget');
    disabledTooltip = ' '+this.i18nService.translate('360.admin.section_listing.disabledSection');
    disabledTooltipHead = this.i18nService.translate('360.admin.section_listing.the') +' ';
    relationshipTypes: any;

    constructor(@Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO, private i18nService: NzI18nService,@Inject('envService') private _env: EnvironmentService) {
        // this.listReportsByAssociation = this.ctx.pageContext === PageContext.R360 && !!this.ctx.relationshipTypeId;
        this.listReportsByAssociation =  !!this.ctx[this.ctx.contextTypeId];
        this.relationshipTypes = cloneDeep(this._env.moduleConfig.relationshipTypes);
    }

    ngOnInit() {
        this.subscribeForSearchInput();
        if (this.sectionCategoryList && this.sectionCategoryList.length) {
            this.sectionCategoryList.forEach((section, index) => {
                if( index == 0){
                    section.active = true;
                }
                else{
                    section.active = false;
                }
            });
        }
    }
    onNodeDragEnd(event) {
        // This is temporary fix for tooltip until it's fixed from horizon side
        const node = event.payload.source.element;
        node.nativeElement.querySelector('.gs-base-content').click();
    }

    subscribeForSearchInput() {
        this.searchInput.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((text: string) => {
            if(text.length>=1 || text.length ==0){
                this.searchTerm = text;
                this.sectionCategoryList.forEach(section => section.active = true);
            }
        });
    }

    clearSearch(){
        this.searchInput.patchValue('')
    }

    onAction(evt: StateAction) {
        const { type, payload } = evt;
        switch (type) {
            case "REPORT_LIST_DATA":
                this.sectionCategoryList.forEach((i) => {
                    if(i.widgetCategory === WidgetCategoryType.REPORT) {
                        i.children = payload;
                    }
                });
                break;
            default: null
        }
    }

}

@Pipe({ name: "addInfoAndMarkDragStatus" })
export class AddInfoAndMarkDragStatusPipe implements PipeTransform {
    transform(value: any, category: any, configuredItems: any): any {
        let { dimensionDetails, widgetCategory } = category;
        this.setWidgetCategory(value, widgetCategory);
        this.setDimensionDetails(value, (value.dimensionDetails || dimensionDetails));
        this.setDraggable(value, configuredItems);
        return value;
    }

    setWidgetCategory(value, widgetCategory) {
        if (widgetCategory === WidgetCategoryType.FIELD) {
            value.subType = WidgetItemSubType.FIELD;
            value.widgetType = WidgetItemType.CR;
            value.widgetCategory = widgetCategory;
            value.multiplesAllowed = false;
            value.configurable = true;
        } else if (widgetCategory === WidgetCategoryType.REPORT) {
            value.subType = WidgetItemSubType.REPORT;
            value.widgetType = WidgetItemType.REPORT;
            value.widgetCategory = widgetCategory;
            value.multiplesAllowed = false;
            value.configurable = true;
        }
        value.widgetCategory = widgetCategory;
        if(value.sectionLabel) {
            value.orginalSectionName = value.sectionLabel;
        } else {
            value.orginalSectionName = value.label;
        }
    }

    setDimensionDetails(value, dimensionDetails: any = { rows: 1, cols: 1 }) {
        if (value && value.data && value.data.dataType && value.data.dataType.toUpperCase() === 'RICHTEXTAREA' || value && value.dataType && value.dataType.toUpperCase() === 'RICHTEXTAREA') {
            dimensionDetails = {
                "rows": 6,
                "cols": 12,
                "minItemCols": 6,
                "minItemRows": 4,
                "maxItemCols": 24,
                "maxItemRows": 9
            }
        }
        value.dimensionDetails = dimensionDetails;
    }

    setDraggable(node, configuredItems) {
        let disableDrag = false;
        let searchedNode;
        if (!node.widgetCategory) {
            // First giving priority to find node and value of same scope
            searchedNode = find(configuredItems, (value) => {
                if(node.scope === value.scope) {
                    if(node.scope === LayoutSectionScope.LOCAL) {
                        if (node.sectionType === value.sectionType) {
                            return value;
                        }
                    } else if(node.scope === LayoutSectionScope.GLOBAL) {
                        if (value.sectionType === node.sectionType) {
                            node.multiplesAllowed = value.multiplesAllowed;
                            return value;
                        }
                    }
                }
            });
            // if node not found, searching configured items to find value of different scope but with same section type
            if(!searchedNode) {
                searchedNode = find(configuredItems, (value) => {
                    if(node.sectionType === value.sectionType) {
                        if(node.scope === LayoutSectionScope.LOCAL) {
                            if(value.scope === LayoutSectionScope.GLOBAL && !node.multiplesAllowed) {
                                return value;
                            }
                        } else if(node.scope === LayoutSectionScope.GLOBAL) {
                            if(value.scope === LayoutSectionScope.LOCAL) {
                                node.multiplesAllowed = value.multiplesAllowed;
                                return value;
                            }
                        }
                    }
                });
            }
        }
        else {
            const props = ({
                [WidgetCategoryType.STANDARD]: ['subType', 'subType'],
                [WidgetCategoryType.FIELD]: ['fieldName', 'fieldName'],
                [WidgetCategoryType.REPORT]: ['reportId', 'id'],
            })[node.widgetCategory];

            if(node.widgetCategory  === WidgetCategoryType.FIELD) {
                node.data.fieldPath = path2FieldInfo(findPath(node)).fieldPath;
                let nodeKey = generateKey(node.data);
                searchedNode = find(configuredItems, confItem => {
                    if(confItem.widgetCategory === node.widgetCategory) {
                        const configuredItemKey = generateKey(confItem.fieldPath ? confItem : confItem.config) || confItem.fieldName;
                        if(nodeKey && configuredItemKey) {
                            return nodeKey === configuredItemKey;
                        } else if(configuredItemKey !== (confItem.fieldName || confItem.config.fieldName)) {
                            return (confItem[props[0]] || confItem.config[props[0]]) === (node.data[props[1]]);
                        }
                    }
                });
            } else {
                searchedNode = find(configuredItems, confItem => (
                    confItem.widgetCategory === node.widgetCategory
                    && (confItem[props[0]] || confItem.config[props[0]]) === (node[props[1]] || node['key'])
                ));
            }
        }
        if (searchedNode && !node.multiplesAllowed) {
            disableDrag = true;
        }
        node.disableDrag = disableDrag;
    }
}

@Pipe({ name: 'filterItems'})
export class FilterItemsPipe implements PipeTransform {
    itemsArray =[];
    transform(items: any[], searchText: string, searchProp) {
        if (!items) {
            return [];
        }
        if (!searchText) {
            return items;
        }
        searchText = (searchText.toLocaleLowerCase() as any);
        this.itemsArray = [];
        this.findMaxRecursive(items, searchText, searchProp);
        return this.itemsArray;
    }

    // This function will check for all nested children of section and return array of elements that match searchText
    findMaxRecursive(items, searchText, searchProp) {
        items.forEach((element) => {
            if (element[searchProp].toLocaleLowerCase().includes(searchText)) {
                this.itemsArray.push(element);
            }
            this.find(element.children, searchText, searchProp);
        });
    }

    // creates recursion for nested children objects
    find(items, searchText, searchProp) {
        if(!items) return;
        this.findMaxRecursive(items, searchText, searchProp);
    }
}
