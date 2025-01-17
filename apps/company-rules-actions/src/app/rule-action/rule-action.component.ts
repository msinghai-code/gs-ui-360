import { ChangeDetectorRef, Component, ComponentFactoryResolver, Inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { IEnv } from '@gs/core';
import { NzNotificationService } from '@gs/ng-horizon/notification';
import {
  ActionHeaderEvents,
  Connections,
  LoadToObjectsOperations,
  moduleConfigForActions,
  SchemaTypes
} from '@gs/rules/core';
import { BionicActionSource, LoadToObjectActionComponent, LoadToObjectService } from '@gs/rules/load-to-object';
import { sortBy } from 'lodash';
import { RuleActionHeaderComponent } from '../rule-action-header/rule-action-header.component';
import { actionAreaNames, COMPANY_SOURCE_DETAILS, RELATIONSHIP_SOURCE_DETAILS } from './rule-action';
import { FeatureFlagService } from '@gs/gdk/services/feature-flag';
import { NzModalService } from '@gs/ng-horizon/modal';

@Component({
  selector: 'gs-rule-action',
  templateUrl: './rule-action.component.html',
  styleUrls: ['./rule-action.component.scss']
})
export class RuleActionComponent extends LoadToObjectActionComponent implements OnInit {

  @Input() actionSource: BionicActionSource;
  @Input() config;

  actionHeaderComponent: RuleActionHeaderComponent;
  objId: string;
  dataLoadVersion: string = 'V1';

  constructor(protected loadToObjService: LoadToObjectService,
    protected cdr: ChangeDetectorRef, protected cfr: ComponentFactoryResolver, notificationService: NzNotificationService,
    @Inject("env") public _env: IEnv, private featureFlagService: FeatureFlagService, protected modal: NzModalService) {
    super(loadToObjService, cdr, cfr, notificationService, modal);
  }

  ngOnInit() {
    this.showReuseSourceOption = true;
  }

  setHeaderAdditionsProps() {
    this.actionHeaderComponent.objectName = this.getCurrentTargetObjectDetails().objectName;
  }

  getHeaderComponentFactory() {
    return this.cfr.resolveComponentFactory(RuleActionHeaderComponent);
  }

  private getCurrentTargetObjectDetails() {
    return this.actionDetails.actionAreaName === actionAreaNames.loadToCompany ? COMPANY_SOURCE_DETAILS : RELATIONSHIP_SOURCE_DETAILS;
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes) {
      // this.config = moduleConfigForActions.BIONIC_RULES;
      this.loadActionHeader();
      this.setInitialConfig();
    }
  }

  getConnections() {
    return [
      {
          "connectionId": "GAINSIGHT_API",
          "connectionName": "Matrix Data",
          "connectionType": "MDA"
      }
    ];
  }

  async setInitialConfig() {
    if(!this.actionDetails.params) {
      this.actionDetails.params = {operation: LoadToObjectsOperations.UPSERT, honourSourceCurrency: true};
    }
    this.targetConfig.host = SchemaTypes.MDA;
    super.setInitialConfig();
    this.targetConfig.baseObject = this.getCurrentTargetObjectDetails().objectName;
    this.targetConfig.honourFieldDbName = true;
    this.getTargetFieldList(Connections.MDA, this.targetConfig.baseObject, false);
    try {
      const featureFlags = await this.featureFlagService.resolve('DATA_LOAD_V2');
      this.dataLoadVersion = featureFlags.split(',').indexOf('RULES') >= 0 ? 'V2': 'V1';
    } catch(e) {
      console.error("Fetch feature toggle failed");
    }
    this.options = {
      ...this.options,
      isCustomTarget: true,
      showLookup: true,
      showIdentifier: true,
      hasCustomBasedObject: true,
      supportedLookups: ["COMPOUND_LOOKUP"],
      isNullTargetAllowed:true,
      configuredAt: 'RULES',
      dataLoadVersion: this.dataLoadVersion,
      includeCustomIntermediateObjects: true,
      previewMode: this.previewMode
    };
  }

  onActionHeaderChange({action, value}: { action: any; value: any }) {
    super.onActionHeaderChange({action, value});
    if (action === ActionHeaderEvents.OPERATION_CHANGE && value === LoadToObjectsOperations.UPDATE) {
      if (this.fieldMapper) {
        this.fieldMapper.mandatoryBannerLabel = '';
      }
      this.targetConfig.mandatoryTargets = [];
    } else if (action === ActionHeaderEvents.OPERATION_CHANGE && value === LoadToObjectsOperations.UPSERT) {
      if (this.fieldMapper) {
        this.fieldMapper.mandatoryBannerLabel = this.getMandatoryBannerLabel();
      }
      this.targetConfig.mandatoryTargets = this.getMandatoryFields();
    }
  }

  async getTargetFieldList(hostInfo, baseObject, byCID?) {
    if (hostInfo && baseObject) {
      this.isBusy = true;
      await this.loadToObjService.getTargetFieldList(hostInfo, baseObject, byCID).then((resp: any) => {
        this.isBusy = false;
        if (resp && resp.obj && resp.obj.fields) {
          const {source, dataStore} = resp.obj;
          let fields = resp.obj.fields;
          this.objId =  resp.obj.objectId;
          fields = this.addPropsToFields(fields, {source: source, dataStore: dataStore})
          this.targetConfig.fieldsList = this.filterAllowedFields(fields, this.targetConfig.host, true, this.targetConfig.baseObject);
          this.targetConfig.baseObjectLabel = resp.obj.label;
          const operation = (
            this.actionDetails &&
            this.actionDetails.params
          ) ? this.actionDetails.params.operation : LoadToObjectsOperations.UPSERT;
          if (operation === LoadToObjectsOperations.UPSERT) {
            this.mandatoryBannerLabel = this.getMandatoryBannerLabel();
            this.targetConfig.mandatoryTargets = this.getMandatoryFields();
          }
          this.fieldsLoaded = true;
          this.beforeFieldMapperLoadsLocal();
          this.loadFieldMapper();
        }

        // TODO: Find a better solution
        if (!this.cdRef['destroyed']) {
          this.cdRef.detectChanges();
        }
      });
    }
  }

  private getMandatoryFields(): any[] {
    return (this.targetConfig.fieldsList || [])
      .filter(f => f.meta && f.meta.required)
      .map(f => {
        return {
          fieldName: f.fieldName,
          label: f.label,
          fields: [f.fieldName],
          entity: f.objectName
        };
      });
  }

  private getMandatoryBannerLabel(): string {
    // TODO: when the action is onboard to i18n, change the banner label accordingly.
    return `Map mandatory target fields from the ${this.targetConfig.baseObjectLabel} object to successfully configure the action.`;
  }

  private beforeFieldMapperLoadsLocal(): void {
    if (this.ruleDetails.tasksType === 'COMPLEX' && !this.actionDetails.actionId && (window as any).GS.gsCurrencyConfig &&
    (window as any).GS.gsCurrencyConfig.currencyVariant === 'MULTI_CURRENCY') {
      this.mapCurrencyIsoCodeByDefault(this.sourceConfig.sourceFields, this.mappings);
    }
  }

  filterAllowedFields(fields, env, showAdditionalOptionsInTarget, targetObjectName) {
    // workaroud to popuate objectId in place of objectName in save cofig
    // waiting for rules team to provide objId in targetConfig
    //this.objId = fields[0].objectId;
    return sortBy(fields, "label");
  }

  getValidationErrors(): Array<string> {
    let errors = super.getValidationErrors();
    if (errors.length) {
      return errors;
    }
    if (this.fieldMapper) {
      errors = errors.concat(this.fieldMapper.getValidationErrors());
    }
    return errors;
  }

  toSaveJson() {
    const saveJSON = super.toSaveJson();
    const importLookupIds = this.fieldMapper.value.mapping ? this.fieldMapper.value.mapping.map((mapping)=>
    mapping.source.lookup && mapping.source.lookup.importLookUpDetailId ? mapping.source.lookup.importLookUpDetailId : '').filter(Boolean) : [];
    // workaroud to popuate objectId in place of objectName in save cofig
    // waiting for rules team to provide objId in targetConfig
    saveJSON.params.objectName = this.objId;

    return {...saveJSON,
      collectionIdToImportLookupIdList:[
      {
        collectionId:this.objId,
        importLookupIds
      }
    ]};
  }

  isPreviewModeOn(): boolean {
    return true;
  }

}
