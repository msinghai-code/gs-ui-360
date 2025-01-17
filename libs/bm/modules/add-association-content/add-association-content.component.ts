import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { HybridHelper } from '@gs/gdk/utils/hybrid';
import { ReportUtils } from '@gs/report/utils';
import { EnvironmentService } from "@gs/gdk/services/environment";
import { NzNotificationService } from '@gs/ng-horizon/notification';
import { forkJoin } from 'rxjs';
import { cloneDeep, forEach, findIndex, keys, isEmpty } from 'lodash';
import { AddAssociationContentService, AssociationCondition, AssociationConfigInfo } from './add-association-content.service';
import { OBJECT_ASSOCIATIONS_MESSAGES } from '@gs/bm/constants';
import { DefaultFieldSearchSetting } from '@gs/bm/interfaces';
import { ObjectNames } from '@gs/bm/constants';
import { Pipe, PipeTransform } from '@angular/core';
import { DataTypes } from '@gs/bm/constants';
import { NzI18nService} from '@gs/ng-horizon/i18n';
import { DescribeService } from '@gs/gdk/services/describe';

@Component({
  selector: 'gs-add-association-content',
  templateUrl: './add-association-content.component.html',
  styleUrls: ['./add-association-content.component.scss']
})
export class AddAssociationContentComponent implements OnInit {

  @Input() associationConfigInfo: AssociationConfigInfo;
  @Input() isBasicConfigEditable = true;
  @Input() relationshipTypesInfo;

  @Output() onSaveOrCancel = new EventEmitter();

  isHybrid = false;
  objectNames = [];
  sfdcObjectNames = [];
  relationshipTypes = [];
  relObjectNames = [];
  selectedRelationshipTypesLabels;
  selectedObjectInfo;
  configs: {conditions: AssociationCondition[]; targetObjectName: string; targetObjInfo: any}[] = []
  loading = true;
  isResetPopupVisible = false;
  isObjectNameEditable = true;
  selectedObjectNames = [];
  errorText: string = '';
  showError: boolean;
  isAllCurrentVisible = false;
  objectAssociationsTypes = {
    SOURCE: "source",
    TARGET: "target"
  }
  targetObj= this.i18nService.translate('360.admin.add_association.target_obj');
  relationshipObj = this.i18nService.translate('360.admin.add_association.rel_obj');
  leftTreeOptions;
  rightTreeOptions;

  constructor(private addAssociationContentService: AddAssociationContentService, private nzNotificationService: NzNotificationService, private i18nService: NzI18nService, private _ds: DescribeService) { 
    
  }

  ngOnInit() {
    this.relationshipTypes = cloneDeep(this.relationshipTypesInfo);
    this.relationshipTypes.unshift({disabled: false, Gsid: "ALL_CURRENT_AND_FUTURE_TYPES", Name: this.i18nService.translate('360.admin.object_assocaition.all_types')});
    this.isHybrid = HybridHelper.isSFDCHybridHost();
    this.associationConfigInfo = {...this.getDefaultAssocConfig(), ...this.associationConfigInfo};
    // Cross check if any relationshipTypes are deleted but still persist in the system.
    if(!!this.associationConfigInfo && !!this.associationConfigInfo.relationshipTypeIds){
      this.associationConfigInfo.relationshipTypeIds = this.associationConfigInfo.relationshipTypeIds.filter((relTypeId: string) => {
        return this.relationshipTypes.some(type => type.Gsid === relTypeId);
      });
    }
    if(!this.isBasicConfigEditable) {
      const selectedRelationshipTypes = this.relationshipTypes.filter(type => this.associationConfigInfo.relationshipTypeIds.includes(type.Gsid));
      this.selectedRelationshipTypesLabels = selectedRelationshipTypes.map(type => type.Name).join();
    } else if(this.associationConfigInfo.objectName){
      this.isObjectNameEditable = false;
    }
    forkJoin([this.addAssociationContentService.getObjects(), 
      this.addAssociationContentService.getSFDCObjects(),
      this.addAssociationContentService.getRelationshipObjects()]).subscribe(data => {
      this.objectNames = data[0];
      this.sfdcObjectNames = data[1];
      this.relObjectNames = data[2];
      this.onSelectedObjectChange(this.associationConfigInfo.objectName, false);
      keys(this.associationConfigInfo.config).forEach(objName => {
        const obj = this.objectNames.concat(this.sfdcObjectNames).find(obj => obj.objectName === objName);
        const targetObjInfo = {...obj, host: ReportUtils.getFieldTreeHostInfo({connectionType: obj.source,connectionId: obj.source, objectName: obj.objectName})};
        this.configs.push({conditions: this.associationConfigInfo.config[objName], targetObjectName: objName, targetObjInfo})
        this.selectedObjectNames.push(obj.objectName);
      });
      this.loading = false;
    });
  }

  getTreeOptions(): any {
    return {
      fieldSearchSetting: {...DefaultFieldSearchSetting, maintainDefaultOrder: false},
      skipFilter: true,
      dragOptions: {
        isOutsideDroppable: false,
        isDragIndicatorRequired: false,
        isDataTypeIconRequired: true
      },
      nestOnDemand: true,
      resolveMultipleLookups: {},
      enablePartialTree: true,
      pageSize: 200,
      root: null,
      maxNestLevels: 2
    };
  }

  onLeftTreeDropdownToggle(visible): void {
    if (visible) {
      this.leftTreeOptions = this.getTreeOptions();
    } else {
      this.leftTreeOptions = null;
    }
  }

  onRightTreeDropdownToggle(visible): void {
    if (visible) {
      this.rightTreeOptions = this.getTreeOptions();
    } else {
      this.rightTreeOptions = null;
    }
  }

  private getDefaultAssocConfig() {
    return {
      config: {
        "relationship": [
          {
            comparisonOperator: "EQ",
            filterField: {},
            leftOperand: {},
            logicalOperator: "AND",
            rightOperandType: "FIELD"
          }
        ]
      },
      advanceAssociationEnabled: false
    }
  }

  onRelationshipTypeChange(selectedTypes: string[], associationConfigInfo: AssociationConfigInfo) {
    if(associationConfigInfo.relationshipTypeIds && associationConfigInfo.relationshipTypeIds.includes("ALL_CURRENT_AND_FUTURE_TYPES")) {
      if(!selectedTypes.includes("ALL_CURRENT_AND_FUTURE_TYPES")) {
        associationConfigInfo.relationshipTypeIds = [];
      } else if(selectedTypes.length !== this.relationshipTypes.length) {
        associationConfigInfo.relationshipTypeIds = selectedTypes.filter(x => x !== 'ALL_CURRENT_AND_FUTURE_TYPES');
      }
    } else if(selectedTypes.includes("ALL_CURRENT_AND_FUTURE_TYPES")) {
      associationConfigInfo.relationshipTypeIds = [];
      associationConfigInfo.relationshipTypeIds.push("ALL_CURRENT_AND_FUTURE_TYPES");
    } else {
      associationConfigInfo.relationshipTypeIds = selectedTypes;
    }
  }

  onSelectedObjectChange(selectedObj, resetState = true) {
    if(!selectedObj) {
      return;
    }
    const allObjectNames = this.objectNames.concat(this.sfdcObjectNames);
    let obj = allObjectNames.find(obj => obj.objectName === selectedObj);
    this.setRelationshipTypes(obj.objectName);
    const objInfo = {...obj, host: ReportUtils.getFieldTreeHostInfo({connectionType: obj.source,connectionId: obj.source, objectName: obj.objectName})};
    if(resetState) {
      this.resetState(this.objectAssociationsTypes.SOURCE);
    }
    this.selectedObjectInfo = objInfo;
  }

  onTargetObjectChange(selectedObj, config: {conditions: any[], targetObjInfo: any, targetObjectName: string}, resetState = true) {
    if(!selectedObj) {
      return;
    }
    delete this.associationConfigInfo.config[config.targetObjectName];
    const obj = this.objectNames.concat(this.sfdcObjectNames).find(obj => obj.objectName === selectedObj);
    const objInfo = {...obj, host: ReportUtils.getFieldTreeHostInfo({connectionType: obj.source,connectionId: obj.source, objectName: obj.objectName})};
    config.targetObjInfo = objInfo;
    config.targetObjectName = objInfo.objectName;
    this.associationConfigInfo.config[objInfo.objectName] = [];
    this.addCondition(objInfo.objectName);
    config.conditions = this.associationConfigInfo.config[objInfo.objectName];
    this.selectedObjectNames = this.configs.map(con => con.targetObjectName);
  }

  private resetState(associationType: string) {
    if(associationType ===  this.objectAssociationsTypes.SOURCE) {
      if(this.selectedObjectInfo) {
        this.associationConfigInfo.relationshipTypeIds = [];
        this.onReset();
      }
    }
  }

  private setRelationshipTypes(objectName: string) {
    this.loading = true;
    this.addAssociationContentService.getFilteredRelationshipTypes(objectName).subscribe(types => {
      this.relationshipTypes = cloneDeep(this.relationshipTypesInfo).map(type => {
          type.disabled = this.associationConfigInfo.relationshipTypeIds && this.associationConfigInfo.relationshipTypeIds.length ? 
                          this.associationConfigInfo.relationshipTypeIds && !this.associationConfigInfo.relationshipTypeIds.includes(type.Gsid) && types.includes(type.Gsid) :
                          (types.includes(type.Gsid) || types.includes("ALL_CURRENT_AND_FUTURE_TYPES"));
          type.Name = type.disabled ? type.Name + " ("+ this.i18nService.translate('360.admin.object_assocaition.alreadyAssociated')+")" : type.Name;
          return type;
      });
      if(!this.relationshipTypes.some(type => type.disabled) || (this.associationConfigInfo && this.associationConfigInfo.relationshipTypeIds && this.associationConfigInfo.relationshipTypeIds.includes("ALL_CURRENT_AND_FUTURE_TYPES"))) {
        this.isAllCurrentVisible = true;
        this.relationshipTypes.unshift({disabled: false, Gsid: "ALL_CURRENT_AND_FUTURE_TYPES", Name: this.i18nService.translate('360.admin.object_assocaition.all_types')});
      }
      this.loading = false;
    });
  }

  addCondition(objName: string) {
    if(!this.associationConfigInfo.config[objName]) {
      this.associationConfigInfo.config[objName] = [];
    }
    this.associationConfigInfo.config[objName].push({
      comparisonOperator: "EQ",
      filterField: {},
      leftOperand: {},
      logicalOperator: "AND",
      rightOperandType: "FIELD"
    });
  }

  onReset() {
    this.configs = [];
    this.associationConfigInfo = this.associationConfigInfo.advanceAssociationEnabled ? {...this.associationConfigInfo, config: {}} : {...this.associationConfigInfo, ...this.getDefaultAssocConfig()};
    this.isResetPopupVisible = false;
    const obj = this.objectNames.find(obj => obj.objectName === ObjectNames.RELATIONSHIP);
    const targetObjInfo = {...obj, host: ReportUtils.getFieldTreeHostInfo({connectionType: obj.source,connectionId: obj.source, objectName: obj.objectName})};
    this.onTargetObjectChange(ObjectNames.RELATIONSHIP, {conditions: [], targetObjInfo, targetObjectName: ObjectNames.RELATIONSHIP});
    this.configs.push({conditions: this.associationConfigInfo.config[ObjectNames.RELATIONSHIP], targetObjectName: ObjectNames.RELATIONSHIP, targetObjInfo});
  }
  
  onAdvanceAssociationChange() {
    if(!this.associationConfigInfo.advanceAssociationEnabled) {
      this.configs = [];
      this.associationConfigInfo.config = this.getDefaultAssocConfig().config;
      const obj = this.objectNames.find(obj => obj.objectName === ObjectNames.RELATIONSHIP);
      const targetObjInfo = {...obj, host: ReportUtils.getFieldTreeHostInfo({connectionType: obj.source,connectionId: obj.source, objectName: obj.objectName})};
      this.configs.push({conditions: this.associationConfigInfo.config[ObjectNames.RELATIONSHIP], targetObjectName: ObjectNames.RELATIONSHIP, targetObjInfo});
    }
  }

  onAdd(targetObjectInfo?: any, targetObjectName?: string) {
    this.configs.push({conditions: [{
      comparisonOperator: "EQ",
      filterField: {},
      leftOperand: {},
      logicalOperator: "AND",
      rightOperandType: "FIELD"
    }], targetObjInfo: targetObjectInfo || {}, targetObjectName: targetObjectName || ""});
  }

  onRemove() {
    this.removeConfig(this.configs[1]);
  }

  removeConfig(config: any) {
    const index = findIndex(this.configs, conf => conf.targetObjectName === config.targetObjectName);
    this.configs.splice(index, 1);
    delete this.associationConfigInfo.config[config.targetObjectName];
  }

  removeCondition(objectName: string, index: any) {
    if(this.associationConfigInfo.config[objectName].length > 1) {
      this.associationConfigInfo.config[objectName].splice(index, 1);
    } else {
      this.errorText = this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.CONDITIONS_MIN_ERROR);
      this.showError = true;
    }
  }

  onFieldSelect(node: any, condition: AssociationCondition, propertyName: string) {
    const { fieldInfo } = node;
    condition[propertyName] = fieldInfo;
    condition.showLeftDropdown = false;
    condition.showRightDropdown = false;
  }

  private getError() {
    if(!this.associationConfigInfo.relationshipTypeIds || !this.associationConfigInfo.relationshipTypeIds.length) {
      return this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.RELATIONSHIP_TYPES_NEEDED);
    }
    if(!this.selectedObjectInfo) {
      return this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.SOURCE_OBJECT_NEEDED);
    }
    let error;
    this.configs.forEach(config => {
      if(!config.conditions[0].filterField.label) {
        error = this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.INVALID_ASSOCIATION);
        return;
      }
      //{360.admin.condition_not_apply}=Conditions can not be empty
      config.conditions.forEach((condition) => {
        if(isEmpty(condition.filterField) || isEmpty(condition.leftOperand)) {
            error = this.i18nService.translate('360.admin.condition_not_apply');
            return;
        }
      })
    });
    return error;
  }

  addTargetObjectLabel(config: {[key:string]: AssociationCondition[]}) {
    try {
      forEach(keys(config), obj => {
        config[obj].forEach(conf => {
          if(conf.filterField && conf.filterField.fieldPath) {
            conf.filterField.fieldPath.right.objectLabel = this.objectNames.find(obj => obj.objectName === conf.filterField.fieldPath.right.objectName).label;
          };
        })
      });
    } catch{}
    return config;
  }

  async onSave() {
    const error = this.getError();
    if(error) {
        this.showError = true;
        this.errorText = error;
      return;
    }
    this.loading = true;
    const body:any = {
      associationId: this.associationConfigInfo.associationId,
      relationshipTypeIds: this.associationConfigInfo.relationshipTypeIds.includes("ALL_CURRENT_AND_FUTURE_TYPES") ? ["ALL_CURRENT_AND_FUTURE_TYPES"] : this.associationConfigInfo.relationshipTypeIds,
      objectName: this.selectedObjectInfo.objectName,
      objectLabel: this.selectedObjectInfo.label,
      source: this.selectedObjectInfo.source,
      config: this.addTargetObjectLabel(this.associationConfigInfo.config),
      advanceAssociationEnabled: this.associationConfigInfo.advanceAssociationEnabled
    };
    if(this.selectedObjectInfo.source !== "MDA"){
      const response = await this._ds.getObjectTree({id:this.selectedObjectInfo.source, type:this.selectedObjectInfo.source}, this.selectedObjectInfo.objectName, 2);
      body.connectionId = response && response.obj && response.obj.connectionId || '';
    }
    this.addAssociationContentService.saveAssociation(body).subscribe(response => {
      if(response.result) {
        this.nzNotificationService.success(this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.SAVE_SUCCESS), {
          nzDuration: 5000,
        });
          this.showError = false;
          this.errorText = '';
      } else {
          this.showError = true;
          this.errorText = this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.FAILED);
      }
      this.onSaveOrCancel.emit(true);
      this.loading = false;
    })
  }

  onCancel() {
    this.onSaveOrCancel.emit();
  }

  filterFn = this.filterFields.bind(this);

  filterFields(fields) {
    return fields.filter(fld => fld.dataType !== DataTypes.IMAGE);
  }

}

@Pipe({name: 'disableResetDefinition',pure: false})
// Check whether any definitions are rendered in order to disable/enable ResetDefinition button
export class DisableResetDefinitionPipe implements PipeTransform {
    transform(value) {
        if(value[0] && value[0].conditions){
            for(const [index, itemVal] of value[0].conditions.entries()){
                if(!isEmpty(itemVal.leftOperand) || !isEmpty(itemVal.filterField)){
                    return false;
                } else {
                    if( index === value[0].conditions.length-1){
                        return true;
                    } else {
                        continue;
                    }
                }
            }
        }
    }
}


@Pipe({ name: 'filterObjects' })
export class FilterObjectsPipe implements PipeTransform {
  transform(objects: any[], objectsToFilter: string[], currentObjectName: string): any[] {
    return objects.filter(obj => !objectsToFilter.includes(obj.objectName) || obj.objectName === currentObjectName);
  }
}

@Pipe({ name: 'filterObjectsForMultipleAssoc', pure: false })
export class FilterObjectsForMultipleAssocPipe implements PipeTransform {
  transform(objects: any[], configs: any[], currentObjectName: string): any[] {
    const objectsToFilter = configs.map(c => c.targetObjectName);
    return objects.filter(obj => !objectsToFilter.includes(obj.objectName) || obj.objectName === currentObjectName);
  }
}
