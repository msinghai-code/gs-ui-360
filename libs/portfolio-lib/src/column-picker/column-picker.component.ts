import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { findPath, path2FieldInfo, fieldInfo2path } from "@gs/gdk/utils/field";
import { GSField } from "@gs/gdk/core";
import { FieldTreeNode } from '@gs/gdk/core/types';
import { DescribeService } from "@gs/gdk/services/describe";
import { CTAFieldConfig, ICockpitColumnPickerOptions, INZCollapsePanel, ITreeData } from './column-picker.interface';
import { forkJoin, Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import * as FieldUtils from "./column-picker.utils";
import get from "lodash/get";
import cloneDeep from "lodash/cloneDeep";
const DATA_TYPES = {
  STRING: 'STRING',
  PERCENTAGE: 'PERCENTAGE',
  CURRENCY: 'CURRENCY',
  NUMBER: 'NUMBER',
  MULTISELECTDROPDOWNLIST: 'MULTISELECTDROPDOWNLIST',
  PICKLIST: 'PICKLIST',
  RTE: 'RICHTEXTAREA',
  BOOLEAN: 'BOOLEAN',
  DATETIME: 'DATETIME',
  DATE: 'DATE',
  LOOKUP: 'LOOKUP',
  URL: 'URL',
  EMAIL: 'EMAIL'
}

@Component({
  selector: 'gs-column-picker',
  templateUrl: './column-picker.component.html',
  styleUrls: ['./column-picker.component.scss']
})
export class ColumnPickerComponent implements OnInit, AfterViewInit {

  isLoading = true;

  @ViewChild('searchInput', {static: false}) searchInput: ElementRef;
  @Input()
  cockpitColumnPickerOptions: ICockpitColumnPickerOptions = {
    objectNames: [],
    baseObjectName: null,
    baseObjectFieldNames: {},
    previousFields: [],
    showCollapsibleSection: true,
    showExtraSection : false,
    levels : 0
  };

  @Input()
  fieldFilterFunction: () => GSField[];

  fieldTreeOptions = {
    selectionMode: "checkbox",
    selection: [],
    isDataTypeIconRequired: true,
    showLookupInfo: false,
    filter: false,
    filterBy: "label"
  };

  panels: INZCollapsePanel[] = [];

  private treeData: ITreeData[];

  searchInputSubject = new Subject<string>();

  searchValue = "";
  debouncedSearchValue = "";

  constructor(private describeService: DescribeService) { }

  ngAfterViewInit() {
    this.searchInput.nativeElement.focus();
    // wait .5s between keyups to emit current value
    this.searchInputSubject
      .pipe(
        filter(val => val.length >= 3 || val.length === 0),
        distinctUntilChanged(),
        debounceTime(500)
      )
      .subscribe(val => {
        this.debouncedSearchValue = val;
      });
  }
  ngOnInit() {

    const treeDataObs$ = this.getTreeData(this.cockpitColumnPickerOptions.objectNames);

    treeDataObs$.subscribe(res => {
      this.treeData = res;
      if (this.cockpitColumnPickerOptions.showExtraSection) {
        this.treeData.unshift(this.buildTreeDataForAddSection(this.cockpitColumnPickerOptions.addCollapsibleSection));
      }
      this.render(res);
      this.isLoading = false;
    });
  }

  buildTreeDataForAddSection(sectionDetails): ITreeData {
    return {
      obj: {
        objectName: sectionDetails.id,
        objectId: sectionDetails.id,
        label: sectionDetails.label,
        fields: []
      },
      children: this.buildTreeNodes(sectionDetails.fields)
    }
  }

  buildTreeNodes(fields): any[] {
    const treeNodes: any[] = [];
    fields && fields.forEach(item => {
      treeNodes.push({
        label: item.label,
        leaf: true,
        icon: FieldUtils.isDAPicklist(item) ? "picklist" : ((item.dataType || "string").toLowerCase()),
        key: FieldUtils.getUniqueNameFromCTAFieldConfig(item),
        data: item,
        selectable: this.cockpitColumnPickerOptions.selectablefunction(item, FieldUtils.getUniqueNameFromCTAFieldConfig(item)),
        styleClass: !this.cockpitColumnPickerOptions.selectablefunction(item, FieldUtils.getUniqueNameFromCTAFieldConfig(item)) ? 'ui-treenode--disabled' : ''
      })
    });
    return treeNodes;
  }

  render(res: ITreeData[]) {
    if (this.cockpitColumnPickerOptions.showCollapsibleSection) {
      this.buildCollapsibleSections(res);
    }
    else {
      // TODO
    }
  }

  buildCollapsibleSections(data: ITreeData[]) {
    const panels: INZCollapsePanel[] = [];
    data.forEach(item => {
      if(this.cockpitColumnPickerOptions.selectablefunction) {
        item.children.forEach(child => child.selectable = this.cockpitColumnPickerOptions.selectablefunction(child.data, FieldUtils.getUniqueNameFromCTAFieldConfig(child.data as any)));
      }
      item.children.forEach(child => child.styleClass = this.getStyleClass(child) || "");
      panels.push({
        active: true, // default all open
        disabled: false,
        name: item.obj.label,
        sourceObjectName: item.obj.objectName,
        sourceObjectTree: item.children,
        fieldTreeOptions: {
          ...this.fieldTreeOptions,
          selection: this.getTreeNodesForPreviousFields(
            item,
            this.getPreviousFieldsByObject(item.obj.objectName)
          )
        }
      })
    });
    this.panels = panels;
  }

  private getStyleClass(child) {
    if(child.children.length) {
      child.children.forEach(subChild => {
        subChild.styleClass = "hide-plus-icon";
      })
    }
    let styleClass = "";
    if(child.data.fieldName === "Name") {
      styleClass = "ui-treenode--disabled name-row";
    } else if(this.cockpitColumnPickerOptions.selectablefunction && !this.cockpitColumnPickerOptions.selectablefunction(child.data, FieldUtils.getUniqueNameFromCTAFieldConfig(child.data as any))) {
      styleClass = 'ui-treenode--disabled';
    }
    return styleClass;
  }

  getPreviousFieldsByObject(objectName: string): any {
    if (this.cockpitColumnPickerOptions.showExtraSection && objectName === get(this.cockpitColumnPickerOptions, "addCollapsibleSection.id")) {
      return get(this.cockpitColumnPickerOptions, "addCollapsibleSection.previousFields");
    }
    else {
      // since, each parent object is in different section, previouFields must be filtered.
      let fieldConfigs: CTAFieldConfig[] = this.cockpitColumnPickerOptions.previousFields.filter(field => (objectName === field.properties.uiTreeRootNode));
      // to remove reference
      fieldConfigs = cloneDeep(fieldConfigs);
      fieldConfigs.forEach(item => {
        if (item.properties.uiTreeRootNode !== this.cockpitColumnPickerOptions.baseObjectName) { item.fieldPath = item.fieldPath.fieldPath }
      });
      return fieldConfigs;
    }
  }

  getSelectedFields(): any {
    const selectedFields = {
      sectionFields: [],
      objectsFields: []
    };
    this.panels.forEach(v => {
      const fields = v.fieldTreeOptions.selection.map(item => {
        if (v.sourceObjectName === get(this.cockpitColumnPickerOptions, "addCollapsibleSection.id")) {
          return item.data
        }
        else {
          return this.getCTAFieldConfigFromTreeNode(item, v.sourceObjectName)
        }
      });
      if (fields.length > 0) {
        v.sourceObjectName === get(this.cockpitColumnPickerOptions, "addCollapsibleSection.id") ?
          (selectedFields.sectionFields = selectedFields.sectionFields.concat(fields)) :
          (selectedFields.objectsFields = selectedFields.objectsFields.concat(fields));
      }
    });
    return selectedFields;
  }

  getCTAFieldConfigFromTreeNode(treeNode: FieldTreeNode, sourceObjectName: string): CTAFieldConfig {
    const pathArray = findPath(treeNode);
    const fieldPathLabel = this.getDisplayFieldPath(pathArray);
    const dataType = this.getDataType(pathArray);
    const fieldConfig: CTAFieldConfig = path2FieldInfo(pathArray);
    fieldConfig.dataType = dataType;
    fieldConfig.formulaField = treeNode.data.meta.formulaField;
    fieldConfig.sortable = treeNode.data.meta.sortable;
    fieldConfig.groupable = fieldConfig.formulaField || dataType === DATA_TYPES.DATETIME ? false : treeNode.data.meta.groupable; //formula fields should not be allowed in grouping
    fieldConfig.properties = fieldConfig.properties || {};
    fieldConfig.properties.updateable = treeNode.data.meta.updateable;
    fieldConfig.properties.path = fieldPathLabel;
    if (![get(this.cockpitColumnPickerOptions, "addCollapsibleSection.id"), this.cockpitColumnPickerOptions.baseObjectName].includes(sourceObjectName)) {
      FieldUtils.addParentFieldPathToFields(
        fieldConfig,
        sourceObjectName,
        this.getFieldInfo(this.cockpitColumnPickerOptions.baseObjectName, this.cockpitColumnPickerOptions.baseObjectFieldNames[sourceObjectName])
      )
    }
    else {
      fieldConfig.properties.uiTreeRootNode = this.cockpitColumnPickerOptions.baseObjectName;
    }
    return fieldConfig;
  }

  getDataType(path: FieldTreeNode[]) {
    const field = path[0];
    const { meta } = field.data as any;
    let { dataType } = field.data;
    if (dataType === DATA_TYPES.DATETIME && (meta.properties.TYPE || '').toUpperCase() === 'DATE_ONLY') {
      dataType = DATA_TYPES.DATE;
    }
    return dataType;
  }
  getDisplayFieldPath(pathArray) {
    if (pathArray.length === 1 && pathArray[0].data.objectName === 'call_to_action') { return pathArray[0].data.label; }
    let path = pathArray.reduceRight((acc, v, i) => `${acc} &rarr; ${v.data.label}`, pathArray[pathArray.length - 1].data.objectLabel)
    let dummyDiv = document.createElement('div');
    dummyDiv.innerHTML = path.indexOf('Call To Action') === -1 ? `Call To Action &rarr; ${path}` : path;
    path = dummyDiv.innerHTML;
    dummyDiv = undefined;
    return path;
  }

  getFieldInfo(objectName: string, fieldName: string): GSField {
    return FieldUtils.getFieldByFieldName(this.treeData.find(item => item.obj.objectName === objectName).obj.fields, fieldName);
  }

  getTreeNodesForPreviousFields(treeData: ITreeData, previouFields: CTAFieldConfig[]): FieldTreeNode[] | any[] {
    if (this.cockpitColumnPickerOptions.showExtraSection && treeData.obj.objectName === get(this.cockpitColumnPickerOptions, "addCollapsibleSection.id")) {
      return this.buildTreeNodes(previouFields);
    }
    else {
      return (previouFields).map((field) => {
        const path = fieldInfo2path(
          { leftOperand: field },
          treeData.children as FieldTreeNode[]
        );
        this.removeAncestorsFromPathArray(path);
        return (path[path.length - 1]);
      })
    }
  }

  removeAncestorsFromPathArray(path) {
    let i = path.length - 1;
    while (i > 0) {
      path[i].parent = path[--i];
    }
  }

  getTreeData(objectNames: string[]): Observable<ITreeData[]> {
    if (!objectNames || objectNames.length === 0) {
      return of([]);
    }
    const host = { id: "mda", name: "mda", type: "mda" };
    return forkJoin(objectNames.map(obj => {
      return this.describeService.getObjectTree(host, obj, this.cockpitColumnPickerOptions.levels || 0, null, { includeChildren: true, skipFilter: true, filterFunction: this.fieldFilterFunction })
    }));
  }


}
