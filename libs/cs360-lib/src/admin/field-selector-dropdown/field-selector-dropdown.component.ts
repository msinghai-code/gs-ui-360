import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { StateAction, HostInfo } from '@gs/gdk/core';
import { GSField } from "@gs/gdk/core";
import { DescribeService } from "@gs/gdk/services/describe";
import { cloneDeep, isEmpty } from 'lodash';

import { FIELD_TREE_DEFAULT_OPTIONS, FIELD_TREE_DEFAULT_SEARCH_SETTINGS } from '@gs/cs360-lib/src/common';
import {
  allowDatatypesForFilters,
  convertIFieldToIFieldInfo,
  getFieldWithLookupToAccount,
  getFieldWithMapping,
  getIdFieldFromAccount
} from "./field-selector-dropdown.utils";
import { getFieldPath } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-field-selector-dropdown',
  templateUrl: './field-selector-dropdown.component.html',
  styleUrls: ['./field-selector-dropdown.component.scss']
})
export class FieldSelectorDropdownComponent implements OnInit {

  @Input() host: HostInfo;

  @Input() objectName: string;

  @Input() field: any;

  @Input() nzOverlayClassName: string = '';

  @Output() action = new EventEmitter<StateAction>();

  public visible: boolean;

  public selectedField: any;

  public treeOptions = cloneDeep(FIELD_TREE_DEFAULT_OPTIONS);

  public fieldSearchSetting = cloneDeep(FIELD_TREE_DEFAULT_SEARCH_SETTINGS);

  public fieldPathLabel: string;

    constructor(private _ds: DescribeService, public i18nService: NzI18nService) {

    }

  ngOnInit() {
    this.fieldSearchSetting.emptyMessage = this.i18nService.translate('360.admin.field_tree.noFieldsFound')
    this.treeOptions = {
      ...this.treeOptions,
      host: this.host,
      allowedDataTypes: allowDatatypesForFilters('STRING'),
      baseObject: this.objectName
    };
    this.bootstrapComponent();
  }

  bootstrapComponent() {
    this._ds.getObjectTree(this.host, this.objectName, this.treeOptions.maxNestLevels, this.treeOptions.allowedDataTypes)
        .then((object) => {
          if(!isEmpty(object)) {
            this.treeOptions = {...this.treeOptions, root: object};
            if(isEmpty(this.field)) {
              this.field = this.autoPopulateFilterFieldByHostType(this.host, object.obj);
            }
            this.action.emit({type: 'FIELD_SELECTED', payload: this.field});
            this.getFieldPathInfo();
          }
        });
  }

  autoPopulateFilterFieldByHostType(host: HostInfo, object: any) {
    const { type } = host;
    const { fields = [], objectName } = object;
    switch (type) {
      case 'MDA':
        // Get the first field with mapping to GS_COMPANY_ID.
        const companyMappedField: GSField = fields.find(field => getFieldWithMapping(field, "GS_COMPANY_ID"));
        if(!!companyMappedField) {
          return convertIFieldToIFieldInfo(companyMappedField);
        } else {
          // Get first GSID field and associate to additional filters.
          const field: GSField = fields.find(field => field.dataType === 'GSID');
          return !isEmpty(field) ? convertIFieldToIFieldInfo(field): {};
        }
      case 'SFDC':
        // If the object is account itself then give preference to Id field of Account object
        const lookupFields: GSField[] = [];
        fields.forEach((field: GSField) => {
          if(getFieldWithLookupToAccount(field)) {
            lookupFields.push(field);
          } else if(objectName.toUpperCase() === "ACCOUNT" && getIdFieldFromAccount(field)) {
            lookupFields.unshift(field);
          }
        });
        return lookupFields.length ? convertIFieldToIFieldInfo(lookupFields[0]): {};
    }
  }

  onDrodownMenuVisible(opened: boolean) {
    if(!this.visible) {
      this.visible = opened;
    }
  }

  onFieldSelected(node: any): void {
    const { fieldInfo } = node;
    this.field = fieldInfo;
    this.getFieldPathInfo();
    this.visible = false;
    this.action.emit({
      type: 'FIELD_SELECTED',
      payload: this.field
    });
  }

  getFieldPathInfo() {
    if(!isEmpty(this.field)) {
      const pathLabel = getFieldPath(this.field);
      this.fieldPathLabel = pathLabel ? pathLabel + ' ➝ ' + this.field.label : this.field.objectLabel +" ["+ this.field.label+"]";
    }
  }

}
