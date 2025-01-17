import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AssociationConfigInfo, AssociationCondition, AddAssociationContentService, MultipleAssociationConfigInfo }  from '../add-association-content.service';
import { HybridHelper } from '@gs/gdk/utils/hybrid';
import { ReportUtils } from '@gs/report/utils';
import { NzNotificationService } from '@gs/ng-horizon/notification';
import { forkJoin } from 'rxjs';
import { cloneDeep, forEach, findIndex, keys } from 'lodash';
import { OBJECT_ASSOCIATIONS_MESSAGES } from '@gs/bm/constants';
import { DefaultFieldSearchSetting } from '@gs/bm/interfaces';
import { ObjectNames } from '@gs/bm/constants';
import { NzI18nService} from '@gs/ng-horizon/i18n';
import { DescribeService } from '@gs/gdk/services/describe';

interface AssociationConfigInfoForMultiple extends AssociationConfigInfo {
  allConfigs?: {conditions: AssociationCondition[]; targetObjectName: string; targetObjInfo: any}[];
  selectedObjectInfo?: any;
  isResetPopupVisible?: boolean;
}
@Component({
  selector: 'gs-multiple-associations-addition-content',
  templateUrl: './multiple-associations-addition-content.component.html',
  styleUrls: ['./multiple-associations-addition-content.component.scss']
})
export class MultipleAssociationsAdditionContentComponent implements OnInit {
  
  @Input() multipleAssociationConfigInfo: MultipleAssociationConfigInfo;
  @Input() relationshipTypesInfo;
  
  @Output() onSaveOrCancel = new EventEmitter();
  
  objectConfigs: AssociationConfigInfoForMultiple[] = [];
  treeOptions = {
    fieldSearchSetting: {...DefaultFieldSearchSetting, maintainDefaultOrder: false},
    skipFilter: true,
    dragOptions: {
      isOutsideDroppable: false,
      isDragIndicatorRequired: false,
      isDataTypeIconRequired: true
    },
    nestOnDemand: true,
    enablePartialTree: true,
    pageSize: 200,
    resolveMultipleLookups: {},
    root: null,
    maxNestLevels: 1
  };
  isHybrid = false;
  objectNames = [];
  sfdcObjectNames = [];
  relObjectNames = [];
  relationshipTypes = [];
  describeResponse:any;
  selectedRelationshipTypesLabels;
  selectedObjectInfo;
  configs: {conditions: AssociationCondition[]; targetObjectName: string; targetObjInfo: any}[] = []
  loading = true;
  isObjectNameEditable = true;
  objectAssociationsTypes = {
    SOURCE: "source",
    TARGET: "target"
  }
  //{360.admin.multiple_associations_addition.target_obj}=Target Object’s Field
  //{360.admin.multiple_associations_addition.rel_obj}=Relationship Object’s Field
  targetObj= this.i18nService.translate('360.admin.multiple_associations_addition.target_obj');
  relationshipObj = this.i18nService.translate('360.admin.multiple_associations_addition.rel_obj');

  constructor(protected addAssociationContentService: AddAssociationContentService, protected nzNotificationService: NzNotificationService, private i18nService: NzI18nService, private _ds: DescribeService) { 
  }

  ngOnInit() {
    this.relationshipTypes = cloneDeep(this.relationshipTypesInfo);
    this.multipleAssociationConfigInfo = {...this.multipleAssociationConfigInfo, objectConfigs: this.multipleAssociationConfigInfo.objectConfigs || []};
    this.isHybrid = HybridHelper.isSFDCHybridHost();
    const selectedRelationshipTypes = this.relationshipTypes.filter(type => this.multipleAssociationConfigInfo.relationshipTypeIds.includes(type.Gsid));
    this.selectedRelationshipTypesLabels = selectedRelationshipTypes.map(type => type.Name).join();
    forEach(this.multipleAssociationConfigInfo.objectNames, obj => {
      const config = this.multipleAssociationConfigInfo.objectConfigs.find(config => config.objectName === obj);
      this.objectConfigs.push({...this.getDefaultAssocConfig(), ...config, objectName: obj, allConfigs: []});
    });
    forkJoin([this.addAssociationContentService.getObjects(), 
      this.addAssociationContentService.getSFDCObjects(),
      this.addAssociationContentService.getRelationshipObjects()]).subscribe(data => {
      this.objectNames = data[0];
      this.sfdcObjectNames = data[1];
      this.relObjectNames = data[2];
      this.objectConfigs.forEach(config => {
        keys(config.config).forEach(objName => {
          const sourceObj = this.objectNames.concat(this.sfdcObjectNames).find(obj => obj.objectName === config.objectName);
          config.objectLabel = sourceObj.label;
          config.selectedObjectInfo = sourceObj;
          config.selectedObjectInfo = {...sourceObj, host: ReportUtils.getFieldTreeHostInfo({connectionType: sourceObj.source,connectionId: sourceObj.source, objectName: sourceObj.objectName})};
          this.getDescribeDetails(sourceObj.source, sourceObj.source,sourceObj.objectName);
          const obj = this.objectNames.concat(this.sfdcObjectNames).find(obj => obj.objectName === objName);
          const targetObjInfo = {...obj, host: ReportUtils.getFieldTreeHostInfo({connectionType: obj.source,connectionId: obj.source, objectName: obj.objectName})};
          config.allConfigs.push({conditions: config.config[objName], targetObjectName: objName, targetObjInfo})
        });
      })
      this.loading = false;
    })
  }

  async getDescribeDetails(id: string, type: string, objectName: string){
    this.describeResponse = await this._ds.getObjectTree({id:id, type:type, apiContext:"api/reporting/describe"}, objectName, 1, null, {skipFilter: true});
  }

  protected getDefaultAssocConfig() {
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

  onTargetObjectChange(selectedObj, config: {conditions: any[], targetObjInfo: any, targetObjectName: string}, associationConfigInfo: AssociationConfigInfoForMultiple, resetState = true) {
    if(!selectedObj) {
      return;
    }
    delete associationConfigInfo.config[config.targetObjectName];
    const obj = this.objectNames.concat(this.sfdcObjectNames).find(obj => obj.objectName === selectedObj);
    const objInfo = {...obj, host: ReportUtils.getFieldTreeHostInfo({connectionType: obj.source,connectionId: obj.source, objectName: obj.objectName})};
    config.targetObjInfo = objInfo;
    config.targetObjectName = objInfo.objectName;
    associationConfigInfo.config[objInfo.objectName] = [];
    this.addCondition(objInfo.objectName, associationConfigInfo);
    config.conditions = associationConfigInfo.config[objInfo.objectName];
  }

  addCondition(objName: string, associationConfigInfo: AssociationConfigInfoForMultiple) {
    if(!associationConfigInfo.config[objName]) {
      associationConfigInfo.config[objName] = [];
    }
    associationConfigInfo.config[objName].push({
      comparisonOperator: "EQ",
      filterField: {},
      leftOperand: {},
      logicalOperator: "AND",
      rightOperandType: "FIELD"
    });
  }

  onReset(associationConfigInfo: AssociationConfigInfoForMultiple) {
    associationConfigInfo.allConfigs = [];
    associationConfigInfo.config = associationConfigInfo.advanceAssociationEnabled ? <any>{} : {...this.getDefaultAssocConfig()};
    associationConfigInfo.isResetPopupVisible = false;
    const obj = this.objectNames.find(obj => obj.objectName === ObjectNames.RELATIONSHIP);
    const targetObjInfo = {...obj, host: ReportUtils.getFieldTreeHostInfo({connectionType: obj.source,connectionId: obj.source, objectName: obj.objectName})};
    this.onTargetObjectChange(ObjectNames.RELATIONSHIP, {conditions: [], targetObjInfo, targetObjectName: ObjectNames.RELATIONSHIP}, associationConfigInfo);
    const config = {conditions: associationConfigInfo.config[ObjectNames.RELATIONSHIP], targetObjectName: ObjectNames.RELATIONSHIP, targetObjInfo};
    associationConfigInfo.allConfigs.push(config);
    this.configs.push(config);
  }
  
  onAdvanceAssociationChange(associationConfigInfo: AssociationConfigInfoForMultiple) {
    if(!associationConfigInfo.advanceAssociationEnabled) {
      associationConfigInfo.allConfigs = [];
      associationConfigInfo.config = this.getDefaultAssocConfig().config;
      const obj = this.objectNames.find(obj => obj.objectName === ObjectNames.RELATIONSHIP);
      const targetObjInfo = {...obj, host: ReportUtils.getFieldTreeHostInfo({connectionType: obj.source,connectionId: obj.source, objectName: obj.objectName})};
      const config = {conditions: associationConfigInfo.config[ObjectNames.RELATIONSHIP], targetObjectName: ObjectNames.RELATIONSHIP, targetObjInfo};
      associationConfigInfo.allConfigs.push(config);
      this.configs.push(config);
    }
  }

  onAdd(associationConfigInfo: AssociationConfigInfoForMultiple, targetObjectInfo?: any, targetObjectName?: string) {
    associationConfigInfo.allConfigs.push({conditions: [{
      comparisonOperator: "EQ",
      filterField: {},
      leftOperand: {},
      logicalOperator: "AND",
      rightOperandType: "FIELD"
    }], targetObjInfo: targetObjectInfo || {}, targetObjectName: targetObjectName || ""});
  }

  removeConfig(config: any, associationConfigInfo: AssociationConfigInfoForMultiple) {
    const index = findIndex(this.configs, conf => conf.targetObjectName === config.targetObjectName);
    this.configs.splice(index, 1);
    delete associationConfigInfo.config[config.targetObjectName];
  }

  removeCondition(objectName: string, index: any, associationConfigInfo: AssociationConfigInfoForMultiple) {
    if(associationConfigInfo.config[objectName].length > 1) {
      associationConfigInfo.config[objectName].splice(index, 1);
    } else {
      this.nzNotificationService.error(this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.CONDITIONS_MIN_ERROR), {nzDuration: 5000});
    }
  }

  onTreeAction(node: any, condition: AssociationCondition, propertyName: string) {
    const { fieldInfo } = node;
    condition[propertyName] = fieldInfo;
    condition.showLeftDropdown = false;
    condition.showRightDropdown = false;
  }

  onSave() {
    let error = false;
    this.objectConfigs.forEach(config => {
      if(!config.allConfigs[0].conditions[0].filterField.label) {
        error = true;
      }
    })
    if(error) {
      this.nzNotificationService.error(this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.INVALID_ASSOCIATION), {
        nzDuration: 5000,
      });
      return;
    }
    this.loading = true;
    const bodies = [];
    this.objectConfigs.forEach(config => {
      bodies.push({
        associationId: config.associationId,
        relationshipTypeIds: this.multipleAssociationConfigInfo.relationshipTypeIds,
        objectName: config.selectedObjectInfo.objectName,
        objectLabel: config.selectedObjectInfo.label,
        source: config.selectedObjectInfo.source,
        config: config.config,
        advanceAssociationEnabled: config.advanceAssociationEnabled,
        connectionId: config.selectedObjectInfo.source !== "MDA" ? this.describeResponse && this.describeResponse.obj && this.describeResponse.obj.connectionId : ''
      });
    })
    this.addAssociationContentService.saveMultipleAssociations(bodies).subscribe(response => {
      if(response.result) {
        this.nzNotificationService.success(this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.SAVE_SUCCESS), {
          nzDuration: 5000,
        });
      } else {
        this.nzNotificationService.error(this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.FAILED), {
          nzDuration: 5000,
        });
      }
      this.onSaveOrCancel.emit(true);
      this.loading = false;
    })
  }

  onCancel() {
    this.onSaveOrCancel.emit();
  }

}
