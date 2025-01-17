import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    Output,
    Pipe,
    PipeTransform,
    SimpleChanges,
    ViewChild
} from "@angular/core";
import {CONTEXT_INFO, ICONTEXT_INFO, isMini360} from '@gs/cs360-lib/src/common';
import { CsmSummaryService } from "../csm-sections/modules/csm-summary/csm-summary.service";
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import { AttributeFieldEditorComponent } from "./attribute-field-editor/attribute-field-editor.component";
import { DataTypes } from "@gs/cs360-lib/src/common";
import { isEqual, isEmpty, unescape, escape } from 'lodash';
import { LOADER_TYPE } from "@gs/gdk/spinner";
import { ObjectNames, PageContext } from '@gs/cs360-lib/src/common';
import { CSMAttributeService } from "../csm-sections/modules/csm-attribute/csm-attribute.service";
import {PORTFOLIO_WIDGET_CONSTANTS } from "@gs/cs360-lib/src/portfolio-copy";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { findFieldInTreeByFieldPath } from '@gs/cs360-lib/src/common';
import { DescribeService } from "@gs/gdk/services/describe";
import { NzI18nService } from "@gs/ng-horizon/i18n";

@Component({
    selector: 'gs-attribute-field-editor-wrapper',
    templateUrl: './attribute-field-editor-wrapper.component.html',
    styleUrls: ['./attribute-field-editor-wrapper.component.scss']
})
export class AttributeFieldEditorWrapperComponent implements OnChanges {

    @ViewChild(AttributeFieldEditorComponent, {static: false}) private fieldEditor: AttributeFieldEditorComponent;

    @Input() isLoading = false;
    @Input() fieldItem;
    @Input() data;
    @Input() isSummarySection;
    @Input() ellispsisRows = 1;
    @Input() treeData;
    @Output() updates = new EventEmitter();
    @Output() editState = new EventEmitter();
    isMini360 = false;
    public isMappingField:boolean = false;
    managedByData: any = null;
    hasManagedByDataChanged: boolean = false;
    isReadOnly: boolean;
    isTooltipVisible = false;
    updatedDataInfo: {data: any; ele: any};
    loaderOptions = {
        loaderType: LOADER_TYPE.SVG,
        loaderParams: {
          svg_url_class: 'gs-loader-vertical-bar-skeleton',
          svg_wrapper_class: 'gs-loader-vertical-bar-skeleton-wrapper-opacity'
        }
    };
    
    @ViewChild('popover', { static: false }) private popover: NzOverlayComponent;
    private toSaveJSON: any = null;

    constructor(
        private csmSummaryService: CsmSummaryService,
        private csmAttributeService: CSMAttributeService,
        private _ds: DescribeService,
        public i18nService: NzI18nService,
        @Inject("envService") private _env: EnvironmentService,
        @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO
    ) {      
        this.isReadOnly = this.csmSummaryService.isReadOnly();
        this.csmAttributeService.attrSaveErrorObservable.subscribe(isError => {
            if(this.fieldEditor && this.fieldEditor.isSaving) { 
                this.manageSavingFlag();
                this.fieldItem = {...this.fieldItem, value: this.data};
            }
        });

        this.csmSummaryService.onAction.subscribe(event => {
            if(event.eventType === 3 && this.fieldEditor && this.fieldEditor.isSaving) {
                this.fieldItem = {...this.fieldItem, value: this.data};
            }
        })
        this.isMini360 = isMini360(this.ctx);
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.treeData && changes.treeData.currentValue){
            this.checkIfMappingField();
        }
        if (changes.data) {
            // Set editability based on current assocaited context
            if(!isEmpty(this.ctx.associatedObjectsEditMap)){
                if(this.fieldItem && !this.fieldItem.fieldPath && this.ctx.associatedObjectsEditMap[this.ctx.associatedContext] && 
                   this.ctx.associatedObjectsEditMap[this.ctx.associatedContext].includes(this.fieldItem.objectName)){
                        this.fieldItem.editable = this.fieldItem && this.fieldItem.properties && this.fieldItem.properties.editable;
                 }else{
                    this.fieldItem.editable = false;
                    this.fieldItem.properties = {
                        ...this.fieldItem.properties,
                        editable: false
                    }
                }
            }else{
                this.fieldItem.editable = this.fieldItem && this.fieldItem.properties && this.fieldItem.properties.editable;
                this.fieldItem.showLockedInfo = !this.fieldItem.editable
            }
            let dataType = this.fieldItem.dataType;
            if(this.fieldItem.fieldName === "CurrencyIsoCode") {
                dataType = DataTypes.PICKLIST;
            }
            this.fieldItem = {...this.fieldItem, value: this.data, dataType};
            if(this.updatedDataInfo) {
                this.updatedDataInfo.data[this.fieldItem.fieldName] = this.data;
                this.fieldEditor.setDisplayValue(this.fieldItem, this.data);
            }
        }
    }
    public async checkIfMappingField(){
        // let data = await this._ds.getObjectTree(MDA_HOST, Cs360ContextUtils.getBaseObjectName(this.ctx), 2, null, {skipFilter: true});
        let field = findFieldInTreeByFieldPath(
            this.fieldItem, isEmpty(this.treeData) ? this.csmAttributeService.treeData:  this.treeData
            );
        if(field && field.data && field.data.meta && field.data.meta.mappings){
          this.isMappingField = true;
        } else {
          this.isMappingField = false;
        }
      }


    private manageSavingFlag(isSaving = false) {
        if(this.fieldEditor) {
            this.fieldEditor.isSaving = isSaving;
        }
    }

    private areNoChangesMade(newValue: any) {
        switch(true) {
            case !newValue: return true;
            case this.fieldItem.dataType === DataTypes.BOOLEAN:
                return newValue.k === this.fieldItem.value.k;
            case this.fieldItem.dataType === DataTypes.MULTISELECTDROPDOWNLIST:
                return newValue.k && isEqual(newValue.k.join(";"), this.fieldItem.value.k);
            case (newValue.k === null && this.fieldItem.value.k === null) || (newValue.k === undefined && this.fieldItem.value.k === undefined): return true;
            case newValue.k === (this.fieldItem && this.fieldItem.value && this.fieldItem.value.k): return true;
            case this.fieldItem.dataType === DataTypes.PICKLIST:
                return !newValue.k && this.fieldItem.value.k === undefined;
        }
    }

    processData(){
        if(this.data && this.data.fv){
            let dataType = this.fieldItem.dataType;
            if(dataType === DataTypes.BOOLEAN) {
              PORTFOLIO_WIDGET_CONSTANTS.BOOLEAN_OPTIONS.map(opt => {
                  isEqual(this.data.fv, opt.value+'') ? this.data.fv = this.i18nService.translate(opt.label): this.data.fv = this.data.fv;
              })
            }
            return this.data.fv;
        }
    }

    fetchManagedByData(data: any) {
        this.managedByData = data;
        this.hasManagedByDataChanged = true;
    }

    onFocusout() {
        if(this.fieldItem.fieldName === 'ManagedBy' && !this.hasManagedByDataChanged) {
            if(!this.updatedDataInfo || !this.updatedDataInfo.data[this.fieldItem.fieldName].fv) {
                this.manageSavingFlag();
                return;
            }
        } 
        if(!this.updatedDataInfo && !this.managedByData) {
            this.manageSavingFlag();
            return;
        }
        let value = null;
        if((this.hasManagedByDataChanged && this.managedByData) || !this.updatedDataInfo) {
            value = {k: this.managedByData.selectedOption.value, fv: this.managedByData.selectedOption.displayValue};
            this.hasManagedByDataChanged = false;
        } else {
            value = this.updatedDataInfo.data[this.fieldItem.fieldName];
        }
        // No changes made
        if(this.areNoChangesMade(value)) {
            this.fieldItem.isEditing = false;
            this.manageSavingFlag();
            return;
        }
        if(this.fieldItem.dataType  === DataTypes.RICHTEXTAREA) {
            const GS = this._env.gsObject;
            if(GS.featureFlags["CR360_TEXT_DATA_DECODING_DONE"]){
                value.k = value.k;
            } else {
                value.k = escape(value.k);
            }
        }
        // let entityType = Cs360ContextUtils.getBaseObjectName(this.ctx);
        // let entityId = Cs360ContextUtils.getUniqueCtxId(this.ctx);
        let entityType = this.ctx.baseObject;
        let entityId = this.ctx[this.ctx.uniqueCtxId];
        let dataEditEntityId;
        if(this.ctx.pageContext === PageContext.R360 && ((this.updatedDataInfo && this.updatedDataInfo.data.field.objectName === "company") || this.fieldItem.objectName === "company")) {
            entityType = ObjectNames.COMPANY;
            dataEditEntityId = this.ctx.cId;
        }
        // If controlling fields present
        if (!this.managedByData && this.updatedDataInfo.data.field.controllingFields && this.updatedDataInfo.data.field.controllingFields.length && this.updatedDataInfo.ele) {
            this.fieldItem.controllingFieldLabels = this.updatedDataInfo.data.field.controllingFieldLabels;
            this.popover.open(new ElementRef(this.updatedDataInfo.ele.hostElement.nativeElement as Element));
            this.toSaveJSON = {
                fieldLabel: this.fieldItem.label,
                [this.fieldItem.fieldName]: value.k,
                entityType,
                entityId,
                dataEditEntityId
            }
            return;
        }
        this.save({
            fieldLabel: this.fieldItem.label,
            [this.fieldItem.fieldName]: value.k,
            entityType,
            entityId,
            dataEditEntityId
        });  
    }
    
    private save(payload) {
        const entityType = payload.entityType;
        const entityId = payload.entityId;
        const dataEditEntityId = payload.dataEditEntityId;
        delete payload.entityType;
        delete payload.entityId;
        delete payload.dataEditEntityId;
        this.updates.emit({
            type: 'SAVE',
            payload,
            entityType,
            entityId,
            dataEditEntityId
        })
    }

    public onValueUpdated(evt, domEle) {
        this.updatedDataInfo = {data:evt, ele: domEle};
    }

    onUpdate() {
        this.manageSavingFlag(true);
        this.popover.close();
        this.save(this.toSaveJSON)
    }

    onCancel() {
        this.popover.close();
        this.fieldItem = {...this.fieldItem};   
    }

    editStateChanged(inEditMode) {
        this.editState.emit(inEditMode);
    }
    tooltipVisible(evt:any){
        this.isTooltipVisible = evt; 
      }
}

@Pipe({ name: "formatData" , pure: false})
export class FormatDataPipe implements PipeTransform {
    constructor(private csmAttributeService: CSMAttributeService, @Inject("envService") private _env: EnvironmentService) {}
  transform(data: any, field: any, urlFormatting?: boolean): any {
    switch(field.dataType) {
        case DataTypes.RICHTEXTAREA:
            const GS = this._env.gsObject;
            if(GS.featureFlags["CR360_TEXT_DATA_DECODING_DONE"]){
                return data;
            } else {
                return unescape(data);
            }
        case DataTypes.URL:
            return urlFormatting && data ? /^(http)(s?):\/\//i.test(data) ? data : 'http://' + data : data;
        default: return data;
    }
  }
}
