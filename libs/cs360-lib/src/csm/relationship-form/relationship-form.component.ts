import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import { compareFields } from "@gs/gdk/utils/field";
import {ReportUtils} from "@gs/report/utils";
import { StateAction, HostInfo, GSField } from '@gs/gdk/core';
import {Observable, forkJoin, of} from 'rxjs';
import {keys, uniqWith, isEmpty} from "lodash";
import {RelationshipFormService} from "./relationship-form.service";
import {MODES} from "./relationship-form";
import {RelationshipFieldEditorComponent} from "./relationship-field-editor/relationship-field-editor.component";
import { isFieldFromLookup } from './../csm-sections/modules/csm-relationship/csm-relationship.utils';
import { CONTEXT_INFO, ICONTEXT_INFO, getFieldWithMapping } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { CS360Service } from '@gs/cs360-lib/src/common';
import {isFieldEditDisabled} from "@gs/cs360-lib/src/portfolio-copy";
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'gs-relationship-form',
  templateUrl: './relationship-form.component.html',
  styleUrls: ['./relationship-form.component.scss']
})
export class RelationshipFormComponent implements OnInit {

  @Input() config: any;

  @Input() fields: GSField[];

  @Input() mode: string = 'EDIT';

  @Output() action = new EventEmitter<StateAction>();

  @ViewChild(RelationshipFieldEditorComponent, {static: false}) relationshipFieldEditorComponent: RelationshipFieldEditorComponent;

  public relationshipTypeSelect = {
    options: [],
    disabled: false,
    hidden: false,
    selectedValue: null
  }
  public host: HostInfo = ReportUtils.getFieldTreeHostInfo(Cs360ContextUtils.getSourceDetailsForRelationship(this.translocoService));
  public objectInfo: any;
  public formLoader: boolean = true;
  public iFields: GSField[] = [];
  public data: any;
  public formMessage: string = this.i18nService.translate('360.csm.relationship_form.selectRelType');
  public showBanner:boolean = false;
  public mandatoryFields:any[] = [];

  constructor(private relationshipFormService: RelationshipFormService,
              private cdr: ChangeDetectorRef,
              @Inject("envService") private _env: EnvironmentService,
              public i18nService: NzI18nService,
              private translocoService: TranslocoService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              public cs360Service: CS360Service) { }

  ngOnInit() {
    this.bootstrapComponent();
  }

  private bootstrapComponent() {
    forkJoin([
      this.relationshipFormService.getAllRelationshipTypes(),
      this.relationshipFormService.describeRelationship(this.host)
    ])
    .subscribe(([options, objectInfo]) => {
      // Populate options.
      this.relationshipTypeSelect = {
        ...this.relationshipTypeSelect,
        selectedValue: this.getSelectedOptionValue(),
        options,
        disabled: [MODES.EDIT, MODES.PREVIEW].includes(this.mode)
      };
      this.objectInfo = objectInfo;
      // populate form now
      this.loadFormsByMode();
      this.formLoader = false;
    })
  }

  private getSelectedOptionValue() {
    const { type, data } = this.config;
    if(this.mode === MODES.EDIT && type.id === "ALL") {
      return !!data.rowIdentifierRelTypeGSID ? data.rowIdentifierRelTypeGSID.v: null;
    } else {
      return !!type && type.id ? type.id: null;
    }
  }

  private loadFormsByMode() {
    if(this.mode === "ADD") {
      // Do nothing
    } else if (this.mode === "EDIT") {
      // Populate form from existing fields
      // Filter fields here
      this.fields = this.fields.filter((f) => !isFieldFromLookup(f));
      this.populateForm(this.objectInfo);
    }
  }

  private async populateForm(objectInfo) {
    const { fields } = objectInfo;
    this.iFields = fields.filter((f: GSField) => this.fields.some((c: any) => this.allowedFields(c, f) && !c['hidden']))
        .map(f => {
          const actualField: any = this.fields.find((c: any) => this.allowedFields(c, f));
          return {
            ...f,
            properties: actualField.properties,
            lookupDisplayField: actualField.lookupDisplayField,
            label: actualField.label,
            editable: !(isFieldEditDisabled(f, Cs360ContextUtils.getRelationshipBaseObjectName()) || getFieldWithMapping(f, 'GS_COMPANY_ID'))
          }
        });
    const GS = this._env.gsObject;
    if(GS.featureFlags['FIELD_LEVEL_PERMISSIONS'] && !this.cs360Service.isSuperAdmin) {
        this.iFields.forEach( field => {
            this.fields.findIndex(sfield => {
                if(field.meta && field.meta.required && (field.properties && !field.properties.editable)){
                    this.showBanner = true;
                    if(this.mandatoryFields.indexOf(field.label || field.fieldName) < 0 && field.label !== 'Relationship Name') {
                        this.mandatoryFields.push(field.label || field.fieldName);
                    }

                }
            })
        })
    }

    const customEvent = new CustomEvent('REL_TYPE_CHANGED', {detail:{'showBannner': this.showBanner}});
    window.dispatchEvent(customEvent);
    this.data = this.mode === "EDIT" ? this.processData(this.config.data, this.fields): await this.processDefaultData(this.iFields);
    const index: number = this.iFields.findIndex((field)=>field.fieldName === 'Name');
    const nameField = this.iFields[index];
    if(index != -1) {
      this.iFields.splice(index, 1);
      this.iFields.unshift(nameField);
    }
    if(this.iFields.length === 0) {
      this.formMessage = "No field(s) are configured for this Relationship Type."
    }
  }

  // /***
  //  * Allow Base fields of relationship.
  //  * @param c
  //  * @param f
  //  * @private
  //  */
  private allowedFields(c: any, f: GSField) {
    return compareFields(c, f);
  }

  private processData(data: any, column: any[]): any {
    const formattedData: any = {};
    keys(data).forEach(k => {
      const col = column.find(c => c.itemId === k);
      if(!isEmpty(col)) {
        // For scorecards since this is a special case and its value is not directly available in the data object
        if (data[k] && data[k].properties && data[k].properties.score && data[k].properties.score !== null && data[k].properties.score !== undefined) {
          data[k].v = data[k].properties.score;
          data[k].fv = data[k].properties.score;
          data[k].k = data[k].properties.score;
        }

        formattedData[col.fieldName] = data[k];
      }
    });
    return formattedData;
  }

  private async processDefaultData(iFields: any[]): Promise<any> {
    const data = await this.relationshipFormService.getCompanyAndTypeData(iFields, this.ctx.cId, this.relationshipTypeSelect.selectedValue);
    return data || {};
  }

  public onTypeChange(relTypeId: string) {

    this.formLoader = true;
    this.relationshipFormService
        .getRelationshipConfigByRelTypeId(relTypeId)
        .subscribe(async (relationshipConfig) => {
          const { list = [], card = [] } = relationshipConfig;
          const allFields = uniqWith([...list, ...card], compareFields)
                              .filter((f) => !isFieldFromLookup(f))
          this.fields = allFields;
          await this.populateForm(this.objectInfo);
          this.formLoader = false;
        })
  }

  serialize() {
    const GS = this._env.gsObject;
    const { data, error } = this.relationshipFieldEditorComponent.serialize();
    if(error) {
      return { type: "SAVE_RELATIONSHIP", payload: {error} };
    }
    if(this.mode === "ADD") {
      return {
        type: "SAVE_RELATIONSHIP",
        payload: {
          mode: this.mode,
          data: {
            ...data,
            TypeId: this.relationshipTypeSelect.selectedValue,
            CompanyId: GS.companyId || "1P02BCN27J6GMN6WVFO663ORBURQWSRQ3XR6"
          }
        }
      }
    } else if(this.mode === "EDIT") {
      return {
        type: "SAVE_RELATIONSHIP",
        payload: {
          mode: this.mode,
          data: {
            ...data,
            TypeId: this.relationshipTypeSelect.selectedValue,
            CompanyId: GS.companyId || "1P02BCN27J6GMN6WVFO663ORBURQWSRQ3XR6",
            Gsid: this.config.data.rowIdentifierGSID.v // This is manadatory
          }
        }
      };
    }
  }
}
