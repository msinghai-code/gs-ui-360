import { ChangeDetectorRef, Component, ComponentFactoryResolver, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { GridsterComponent, GridsterConfig, GridsterItem, GridsterItemComponentInterface } from 'angular-gridster2';
import { ISection, getFieldItemId, isMultiObject } from '@gs/cs360-lib/src/common';
import { SectionListOptions } from '../shared/section-listing/section-listing.interface';
import { SummaryConfigurationService } from '@gs/cs360-lib/src/common';
import { SubSink } from 'subsink';
import { APPLICATION_MESSAGES, ObjectNames, PageContext, SUMMARY_GRIDSTER_DEFAULTS } from '@gs/cs360-lib/src/common';
import { GenericHostDirective } from '@gs/cs360-lib/src/common';
import AdminSectionInterface from '../AdminSectionInterface';
import { WidgetCategory, SummaryWidget, WidgetItemSubType, WidgetCategoryType, WidgetItemType, DimensionDetails } from '@gs/cs360-lib/src/common';
import { getWidgetId, transformWidgetDimensions } from '@gs/cs360-lib/src/common';
import { AbstractWidgetProvider } from '@gs/cs360-lib/src/common';
import { WidgetProviderRegistry } from '../../../builder-widgets/bulder-widget-registry';
import { WidgetSettingProviderRegistry } from '../../../builder-widgets/builder-widget-setting-registry';
import { BehaviorSubject } from "rxjs";
import { each, find, isEmpty, isUndefined } from 'lodash';
import { DataTypes } from '@gs/cs360-lib/src/common';
import { findFieldInTree, getDefaultFormat, getDefaultNumericalSummarization, getIsEditDisabled, getLookupDisplayField } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO,RENDER_TYPES } from '@gs/cs360-lib/src/common';
import { CS360Service } from '@gs/cs360-lib/src/common';
import { NzModalService } from '@gs/ng-horizon/modal';
import { NzI18nService } from "@gs/ng-horizon/i18n";
import { summaryConfig } from './summary-configuration.config';
import { BaseWidgetSettingsRendererService } from '../../../builder-widgets/base-widget-settings-renderer/base-widget-settings-renderer.service';
import { BaseWidgetRendererService } from '../../../builder-widgets/base-widget-renderer/base-widget-renderer.service';
import { ActivatedRoute } from '@angular/router';
import { concat } from 'lodash';
@Component({
  selector: 'gs-summary-configuration',
  templateUrl: './summary-configuration.component.html',
  styleUrls: ['./summary-configuration.component.scss']
})
export class SummaryConfigurationComponent implements OnInit, OnDestroy, AdminSectionInterface {
  widgetCategories$: BehaviorSubject<Array<WidgetCategory>>;
  widgetListLoading$: BehaviorSubject<any>;

  options: GridsterConfig;
  detachViewOptions: GridsterConfig;
  section: ISection;
  sectionListOptions: SectionListOptions = {
    title: this.i18nService.translate("360.admin.APPLICATION_MESSAGES.SUMMARY_SECTION_HEADER.title"),
    description: this.i18nService.translate("360.admin.APPLICATION_MESSAGES.SUMMARY_SECTION_HEADER.description")
};
  configuredWidgets: SummaryWidget[] = [];
  isSaveInProgress: boolean = false;
  private subs = new SubSink();
  public widgetSettings = {
      loading: false,
      widthPercentage: "30%",
      open: false,
      context: {
        componentRef: null,
        componentType: null
      },
    close: this.closeSettings.bind(this),
    save: this.saveSettings.bind(this),
    subType: ''
  };
  maxLimit: number = 0; // need to move using bootsrap
  sectionNameLimit: number = 90;
  itemIdCounter: number = 0; // do not remove it
  isConfigurationTouched: boolean = false;
  isPartner: boolean = false;
  allFieldWidgets;
  widgetName: string;
  isSettingsSaveDisabled = false;
  @ViewChild("gridster", { static: true }) gridster: GridsterComponent;
  @ViewChild(GenericHostDirective, { static: false }) hostRef: GenericHostDirective;
  configLoading: boolean;
  //@Input() fields:any;
  private widgetCategories: WidgetCategory;

  constructor(private summaryConfigrationService: SummaryConfigurationService,
              private modalService: NzModalService,
              private renderer: Renderer2,
              private c360Service: CS360Service,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              protected cfr: ComponentFactoryResolver,
              protected viewContainerRef: ViewContainerRef,
              private cdr: ChangeDetectorRef,
              private route: ActivatedRoute,
              private i18nService: NzI18nService,
              private widgetRendService:BaseWidgetRendererService,
              private widgetSettingRendService:BaseWidgetSettingsRendererService) {
    this.widgetCategories$ = this.summaryConfigrationService.widgetCatgories;
    this.widgetListLoading$ = this.summaryConfigrationService.widgetListLoading;
    this.maxLimit = this.summaryConfigrationService.getMaxWidgetAllowed();
  }

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    if(queryParams.managedAs  &&  queryParams.managedAs === "partner") {
      this.isPartner = true;
    }
    this.options = {
      ...SUMMARY_GRIDSTER_DEFAULTS.GRIDSTER_BUILDER_VIEW(),
      itemResizeCallback: this.onResize.bind(this),
      itemChangeCallback: this.widgetChanged.bind(this)
    };
    this.detachViewOptions = {
      ...SUMMARY_GRIDSTER_DEFAULTS.GRIDSTER_BUILDER_VIEW(),
      draggable: { enabled: false },
      resizable: { enabled: false },
    }
    this.getSectionCatergoryList();
    this.subscribeForWidgetsMapping();
    //this.settingConfigStandardConfiguredWidgets(); /*checking for test*/
  }

  private getSectionCatergoryList(): void {
    this.summaryConfigrationService.getWidgetList(this.isPartner);
  }

  private setConfiguredWidgets(widgets): void {
    this.configuredWidgets = widgets.map((widgetItem: SummaryWidget) => {
      const widgetDimensions = transformWidgetDimensions(widgetItem.dimensionDetails);
      const axisDetails = widgetItem.axisDetails;
      if (widgetItem.dimensionDetails) {
        widgetItem.dimensionDetails.rows = widgetItem.rows ? widgetItem.rows : widgetItem.dimensionDetails.rows;
        widgetItem.dimensionDetails.cols = widgetItem.cols ? widgetItem.cols : widgetItem.dimensionDetails.cols;
        if (widgetItem.axisDetails) {
          widgetItem.axisDetails.x = widgetItem.hasOwnProperty('x') ? widgetItem.x : widgetItem.axisDetails.x;
          widgetItem.axisDetails.y = widgetItem.hasOwnProperty('y') ? widgetItem.y : widgetItem.axisDetails.y;
        }
      }
      return {
        ...widgetItem,
       ...axisDetails,
       ...widgetDimensions,
       ...widgetItem.dimensionDetails,
       ...widgetItem.axisDetails,
        mini360Dimensions: widgetItem.mini360Dimensions,
        itemId: this.getItemId(widgetItem),
        initCallback: this.loadWidget.bind(this),
        isLoading: true,
        properties: widgetItem.properties,
        resizeEnabled : this.isResizeEnabled(widgetItem.dimensionDetails),
        editableTitle: this.isEditableTitle(widgetItem.widgetType)
      };
    });

  }

  private isResizeEnabled(config: DimensionDetails) {
    if (config)
      return (config.maxItemCols === config.minItemCols && config.maxItemRows === config.minItemRows) ? false : true;
    else
      return true;
  }

  private isEditableTitle(widget: WidgetItemType) {
      return (widget === WidgetItemType.NPS) ? false : true;
  }

  private subscribeForWidgetsMapping(): void {
    this.configLoading = true;
    this.summaryConfigrationService.getResolvedwidgetCategories().subscribe(widgetCategories => {
      this.configLoading = false;
      this.widgetCategories = widgetCategories || {};
      this.allFieldWidgets = widgetCategories.Field ? widgetCategories.Field[0] : {children:[]};

        const widgets = this.section && this.section.config && this.section.config.widgets && this.section.config.widgets.length ? this.section.config.widgets : [];
        this.setConfiguredWidgets(widgets);
      each(this.configuredWidgets, (widgetItem: SummaryWidget) => {
        if(widgetItem.widgetCategory === WidgetCategoryType.STANDARD) {
          this.settingConfigStandardConfiguredWidgets();
          const originalWidget = widgetCategories.Standard && widgetCategories.Standard[0] && widgetCategories.Standard[0].children && widgetCategories.Standard[0].children.find(widget => widget.subType === widgetItem.subType)
          if(originalWidget) {
            widgetItem.displayName = originalWidget.label;
          }
        }
        const masterCategories = widgetCategories[widgetItem.widgetCategory];
        if (masterCategories && masterCategories.length) {
          const [masterCategory] = masterCategories;
          this.mapWidgetGlobalData(masterCategory, widgetItem);
        } else {
          widgetItem.isLoading = false;
        }
      });
    });
  }
  /******Default config for the standard specific widgets *****/
  settingConfigStandardConfiguredWidgets(){
    each(this.configuredWidgets, (widgetItem: SummaryWidget) => {
  if(widgetItem.config == null){
    if(widgetItem.subType === WidgetItemSubType.CSM){
      widgetItem.config = this.getDefaultStandardConfig(widgetItem);
      const fields = this.summaryConfigrationService.getobjectmetadata()
      const index = fields.findIndex(field => field.data.fieldName == 'Csm');
       widgetItem.lookupDisplayField = getLookupDisplayField({...widgetItem, data: fields[index].data , dataType : "LOOKUP"},  fields[index].children);
       }
      if(widgetItem.subType === WidgetItemSubType.ORIGINAL_CONTRACT_DATE){
        widgetItem.config = this.getDefaultStandardConfig(widgetItem);
       }
    }
    })
  }

    // This function will check for all nested children of section and set original label for the matched element
    // Used for setting field path and hover label
    addHoverLabelToFields(allFields, widgetItem, fieldPath?: any) {
        if(widgetItem.widgetCategory === WidgetCategoryType.FIELD) {
          allFields.forEach((field) => {
            if(isUndefined(fieldPath)) {
              fieldPath = (widgetItem.config && widgetItem.config.fieldPath) || widgetItem.fieldPath;
            }
            if(fieldPath && (field.data.fieldName === fieldPath.right.fieldName)) {
              fieldPath.right.label = field.label;
              this.addHoverLabelToFields(field && field.children, widgetItem, fieldPath.fieldPath);
            } else if (widgetItem.config && widgetItem.config.fieldName === field.data.fieldName && !fieldPath) {
              widgetItem.hoverLabel =  field.data.label;
              field.hoverLabel =  field.data.label;
              return widgetItem;
            }
          });

        } else {
          allFields.forEach((field) => {
            if(isUndefined(fieldPath)) {
              fieldPath = (widgetItem.config && widgetItem.config.fieldPath) || widgetItem.fieldPath;
            }
            if(fieldPath && (field.data.fieldName === fieldPath.right.fieldName)) {
              fieldPath.right.label = field.label;
              this.addHoverLabelToFields(field && field.children, widgetItem, fieldPath.fieldPath);
            } else if (((widgetItem.config && widgetItem.config.fieldName || widgetItem.subType) === (field.data.fieldName)) && !fieldPath) {
              widgetItem.hoverLabel =  field.data.label;
              return widgetItem;
            }
          });

        }
    }

  private mapWidgetGlobalData(masterCategory: WidgetCategory, widgetItem: any): void {
    const { widgetCategory, children, mini360Dimensions } = masterCategory;
    let widget;
    switch (widgetCategory) {
      case WidgetCategoryType.FIELD: {
        widget = this.findField(widgetItem, children);
        this.widgetMetaProperties(widget, widgetItem);
        widgetItem.mini360Dimensions = mini360Dimensions;
        break;
      }
      case WidgetCategoryType.REPORT: {
        const parentObject = find(children, (value) => value.data && value.data.objectName === widgetItem.config.collectionDetail.objectName);
        if (parentObject && parentObject.children) {
          widget = find(parentObject.children, (value) => value.id === widgetItem.config.reportId);
          widgetItem.configurable = true;
            this.addHoverLabelToFields(this.allFieldWidgets.children, widgetItem);
          widgetItem.mini360Dimensions = mini360Dimensions;
        }
        break;
      }
      default: {
        widget = find(children, (value) => value.subType === widgetItem.subType);
        if(WidgetItemSubType.CSM === widgetItem.subType){
          this.widgetMetaProperties(widget, widgetItem);
        }
        if (widget) {
          widgetItem.configurable = widget.configurable;
          widgetItem.removable = "removable" in widget ? widget.removable : true;
          widgetItem.properties = {
            ...widget.properties,
            ...widgetItem.properties
          };
          widgetItem.mini360Dimensions = widget.mini360Dimensions;
          this.addHoverLabelToFields(this.allFieldWidgets.children, widgetItem);
        }
      }
    }
    widgetItem.isLoading = false;
  }

  private findField(widgetItem, treeData, fieldPath = widgetItem.config.fieldPath) {
    if(!fieldPath) {
      return find(treeData, (value) => value.data && value.data.fieldName === widgetItem.config.fieldName);
    }

    return this.findField(widgetItem, find(treeData, (value) => value.data && value.data.fieldName === fieldPath.right.fieldName).children, fieldPath.fieldPath);
  }

  widgetMetaProperties(widget, widgetItem){
    if (widget && widget.data) {
      widgetItem.meta = widget.data.meta;
      widgetItem.configurable = true;
      widgetItem.removable = true;
      this.addHoverLabelToFields(this.allFieldWidgets.children, widgetItem);
    } else {
      widgetItem.meta = {
        properties: {}
      };
    }
  }

  private addItem(widgetItem: SummaryWidget) {
    const widgets = this.section && this.section.config && this.section.config.widgets || [];
    const mergedArray = concat(widgets, this.configuredWidgets);
    const maxItemId = mergedArray && mergedArray.length > 0 ? Math.max(...mergedArray.map(obj => parseInt(obj.itemId.slice(1)))) : this.itemIdCounter;
    this.itemIdCounter = maxItemId;
    const dimensionDetails = transformWidgetDimensions(widgetItem.dimensionDetails);
    const newItem = {
      ...widgetItem,
      itemId: this.getItemId(),
      ...(dimensionDetails || {}),
      initCallback: this.loadWidget.bind(this),
      resizeEnabled : this.isResizeEnabled(widgetItem.dimensionDetails),
      editableTitle: this.isEditableTitle(widgetItem.widgetType)
    } as any;
    const nextPosition: object = this.gridster.getFirstPossiblePosition(newItem);
    const newWidgetItem = { ...newItem, ...nextPosition };
    delete newWidgetItem.data;
    delete newWidgetItem.dimensionDetails;
    delete newWidgetItem.axisDetails;
    this.addHoverLabelToFields(this.allFieldWidgets.children, newWidgetItem);
    this.configuredWidgets = [...this.configuredWidgets, newWidgetItem as SummaryWidget];
    this.cdr.detectChanges();
  }

  isKPIWidget(data): boolean {
    const { visualizationType } = data;
    return ['KPI'].includes(visualizationType);
  }

  onSectionDrop(evt) {
    this.isConfigurationTouched = true;

    const section = evt.item.data;
    let { widgetCategory, dimensionDetails } = section;
    const isAlreadyExist = this.checkIsWidgetAlreadyExists(section);
    if (isAlreadyExist) {
      return;
    }
    switch (widgetCategory) {
      case WidgetCategoryType.REPORT: {
        const { data, parent: { data: collectionDetail }, configurable } = section;
        const isKPIWidget = this.isKPIWidget(data);
        if(isKPIWidget){
          dimensionDetails = {};
          dimensionDetails.maxItemCols=6;
          dimensionDetails.minItemCols=3;
          dimensionDetails.minItemRows=3;
          dimensionDetails.maxItemRows=6;
          dimensionDetails.cols = 4
          dimensionDetails.rows= 3;
        }
        this.addItem({
          ...data,
          subType: WidgetItemSubType.REPORT,
          widgetType: WidgetItemType.REPORT,
          dimensionDetails,
          widgetCategory,
          // configurable : this.ctx.pageContext ===PageContext.C360 ? configurable: false,
          configurable : this.ctx.standardWidgetConfig[WidgetCategoryType.REPORT].configurable ? configurable: false,
          config: { ...data, collectionDetail }
        });
        
        break;
      }
      case WidgetCategoryType.FIELD: {
        this.summaryConfigrationService.setFieldPath(section);
        const config = this.getDefaultFieldConfig(section);
        const lookupDisplayField = getLookupDisplayField(section, this.getChildren(section));

        this.addItem({ 
          ...section,
          ...section.data,
          subType: WidgetItemSubType.FIELD,
          widgetType: WidgetItemType.CR,
          config,
          lookupDisplayField,
          removable: true
        });

        break;
      } 
      case WidgetCategoryType.STANDARD: {
        const config = this.getDefaultStandardConfig(section);
        /*fixed from ui but the better optimisation should be taken from backend acc to bandwidth*/
        const fields = this.summaryConfigrationService.getobjectmetadata();
        let lookupDisplayField = null;
        if(fields && fields.length){
            const index = fields.findIndex(field => field.data.fieldName == 'Csm');
            if (index !== -1) {
                lookupDisplayField = getLookupDisplayField(Object.assign({}, section, { data: fields[index].data, dataType: "LOOKUP" }), fields[index].children);
                if (!section.properties) {
                    section.properties = {};
                }
            }
        }
        // Csm as a lookup is only case of company in P,CP,Rp we are not finding any lookup fields which we honor on priority
        this.addItem({
          ...section,
          config,
          lookupDisplayField,
          properties: {
            ...section.properties,
          },
          removable: "removable" in section ? section.removable : true
        });
      }
    }
  }

  /**
   * If this.searchTerm is present, that is the tree is filtered, then field.children will also be filtered, so in that case we need to get complete children details from original company object (complete)
   */
  private getChildren(field) {
    if(field.dataType === DataTypes.LOOKUP) {
      const fld = findFieldInTree(field, this.allFieldWidgets);
      if(fld) {
        return fld.children;
      }
    }
  }

  private getDefaultStandardConfig(section) {
    switch(section.subType) {
      case WidgetItemSubType.IMAGE: {
        return {
          fieldName: "Logo",
          objectName: this.ctx.baseObject,
          dataType: DataTypes.IMAGE,
          properties: {
            editable: true
          }
        }
      }
      case WidgetItemSubType.TEXT: {
        return {
          fieldName: this.ctx.standardWidgetConfig[WidgetItemSubType.TEXT].fieldName,
          objectName: this.ctx.standardWidgetConfig[WidgetItemSubType.TEXT].objectName || this.ctx.baseObject,
          dataType: DataTypes.RICHTEXTAREA,
          properties: {
            editable: false
          }
        }
      }
      case WidgetItemSubType.HEALTH_SCORE_METRIC:
      case WidgetItemSubType.HEALTH_SCORE_METRIC_AND_HISTORY: {
        return {}
      }
      case WidgetItemSubType.COCKPIT_CTA: {
        return (section.properties && section.properties.options && section.properties.options.filter(opt => opt.selected)) || []
      }
      case WidgetItemSubType.ORIGINAL_CONTRACT_DATE: {
        return {
          fieldName: "OriginalContractDate",
          dataType: "DATE",
          formatOptions: {
            skipFormatting: true,
            customFormatterType: "SUMMARY_DATA_TYPE"
          }
        }
      }

      case WidgetItemSubType.CSM: {
        return {
       fieldName : 'Csm',
       dataType : DataTypes.LOOKUP,
      //  objectName : this.ctx.pageContext === PageContext.C360 ? ObjectNames.COMPANY : ObjectNames.RELATIONSHIP,
       objectName : this.ctx.baseObject,
        meta:{
       properties: {
        editable: false,
        required: null,
        navigationConfig: null,
        updateable: false
       },
        },
    properties:{
      editable:  false,
      required: false
    },
      formatOptions: {
        type : null,
        numericalSummarization: null
      },
      scale: 0,
      key: 'Csm',
    };

        }

        default: {
          return section.config;
        }
      }
  }

  private getDefaultFieldConfig(section) {
    const { fieldName, dataType, objectName, meta, objectLabel } = section.data;
    return {
      fieldName,
      dataType,
      objectName,
      objectLabel,
      properties: {
        editable: false,
        required: null,
        navigationConfig: null,
      },
      formatOptions: {
        type: getDefaultFormat(dataType),
        numericalSummarization: getDefaultNumericalSummarization(dataType)
      },
      scale: meta && meta.decimalPlaces,
      key: section.key,
    };
  }

  onSectionDelete(item: SummaryWidget) {
    this.isConfigurationTouched = true;
    this.configuredWidgets = this.configuredWidgets.filter(widget => widget.itemId !== item.itemId);
    this.cdr.detectChanges();
  }


  private onResize(item: GridsterItem, itemComponent: GridsterItemComponentInterface) {
    if(itemComponent.resize.width) {
      this.isConfigurationTouched = true;
    }
    if (item.subType === WidgetItemSubType.ATTRIBUTE) {
      window.dispatchEvent(new Event('resize'));
      itemComponent["gsResizeEmitter"] && itemComponent["gsResizeEmitter"].emit(itemComponent);
    }
  }

  private getItemId(item?) {
    this.itemIdCounter = item && item.itemId ? parseInt(item.itemId.slice(1)) : this.itemIdCounter + 1;
    return getWidgetId(this.itemIdCounter, 'w');
  }

  public validate() {
    const invalidWidgets: string[] = [];
    this.configuredWidgets.forEach((item) => {
      switch (item.widgetCategory) {
        case WidgetCategoryType.REPORT: {
          // if (this.ctx.pageContext === PageContext.C360 && (!item.config || !item.config.filterField)) {
          if (summaryConfig[this.ctx.pageContext].invalidateWidgetsForReport && (!item.config || !item.config.filterField)) {
            invalidWidgets.push(item.label);
          };
          break;
        }
        case WidgetCategoryType.FIELD: {

          break;
        }
        // case WidgetCategoryType.STANDARD:{
        //   if(item.configurable && item.config == null){
        //     invalidWidgets.pop();
        // }
        // break;
      //}
        default: {
          if (item.configurable && (!item.config || isEmpty(item.config))) {
            invalidWidgets.push(item.label);
          }
        }
      }
    });

    return {
      valid: invalidWidgets.length === 0,
      message: invalidWidgets.length && APPLICATION_MESSAGES.CONFIG_NOT_PRESENT(invalidWidgets)
    }
  }

  async loadWidget(e, itemComponent: GridsterItemComponentInterface) {
    const { item } = itemComponent;
    const widgetComponentClass = this.widgetRendService.getComponentClass(this.ctx.pageContext,item.subType);

    let componentClass = null;
    if(widgetComponentClass){
      componentClass = widgetComponentClass;
    }
    else {
      const widgetProvider: AbstractWidgetProvider = WidgetProviderRegistry.getWidgetProvider(item.subType);
      if (!widgetProvider) { console.error(`there is no provider for widget ${item.type} and subType ${item.subType}`); return; }
      componentClass = await widgetProvider.getWidgetView();
      if (!componentClass) { return; }
    }
    const factory = this.cfr.resolveComponentFactory(componentClass);
    const ref = this.viewContainerRef.createComponent(factory);
    const widgetInstance = (ref.instance as any);
    widgetInstance.destroy = () => ref.destroy();
    widgetInstance.id = this.getItemId(item);
    widgetInstance.widgetItem = item;
    widgetInstance.widgetItem.widgetMeta = new BehaviorSubject(null);
    widgetInstance.config = item.config;
    widgetInstance.ctx = this.ctx;
    widgetInstance.type = RENDER_TYPES.WIDGET;
    itemComponent["gsResizeEmitter"] = new EventEmitter();
    widgetInstance.onWidgetResize = itemComponent["gsResizeEmitter"];
    widgetInstance.parentItemComponent = itemComponent;
    widgetInstance.isDetachPreview = !!this.section.isDetachSectionPreview;
    widgetInstance.allFieldWidgets = this.allFieldWidgets;
    if (widgetInstance && widgetInstance.changes)
      widgetInstance.changes.subscribe((changes) => {
          const payload = changes.payload && changes.payload.widgetElement ? changes.payload.widgetElement : changes.payload;
        this.subscribeToChanges(changes.type,changes.widgetItem || payload);
      });
    ref.changeDetectorRef.detectChanges();
    widgetInstance.element = ref.location.nativeElement;
    this.renderer.setAttribute(widgetInstance.element, 'class', 'widget-builder-element gridster-item-content');
    itemComponent.el.appendChild(widgetInstance.element);
  }

  subscribeToChanges(type: string, widgetItem: any ) {
      const value = widgetItem && widgetItem.value;
    switch(type) {
      case 'CONFIGURE': {
        this.configureWidget(widgetItem);
        break;
      } 
      case 'UPDATE_WIDGET': {
        this.configuredWidgets.map((widget: any) => {
          if (widgetItem.itemId === widget.itemId) {
            widget.config = widgetItem.config;
          }
          return widget;
        });
        break;
      }
      case 'TOUCHED': {
        this.isConfigurationTouched = true;
        break;
      }
      case 'DISABLE_SETTINGS_SAVE': {
        this.isSettingsSaveDisabled = value;
        break;
      }
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onLabelClick(item: SummaryWidget) {
    if(item.widgetType === WidgetItemType.REPORT) {
      return;
    }
    if(!item.editableTitle) {
      return;
    }

    if (!item.showLabelInput) {
      item.showLabelInput = true;
      item.tempLabel = item.label;
    }
  }

  showLoader(flag: boolean): void {
    this.isSaveInProgress = flag;
  }

  isConfigurationChanged() {
    return this.isConfigurationTouched;
  }

  markConfigurationAsPristine() {
    this.isConfigurationTouched = false;
  }

  toJSON() {
    const items = this.convertToJSON();
    return { widgets: items };
  }

  private convertToJSON() {
    const value = this.configuredWidgets.sort((a, b) => {
      let axisDetailsA1: any = a.axisDetails;
      let axisDetailsA2: any = b.axisDetails;
      if (!axisDetailsA1) {
        axisDetailsA1 = { y: a.y };
      }
      if (!axisDetailsA2) {
        axisDetailsA2 = { y: b.y };
      }
      return axisDetailsA1.y - axisDetailsA2.y;
    });
    const items = value.map((item, i) => {
      switch (item.widgetCategory) {
        case WidgetCategoryType.FIELD: {
          const mini360Dimensions = item.config.dataType === "RICHTEXTAREA" ? {rows: 8, cols: 24} : this.allFieldWidgets.mini360Dimensions
          return {...this.transformFieldConfig({ ...item, ...item.config, mini360Dimensions: mini360Dimensions }, true), displayOrder: i};
        }
        case WidgetCategoryType.REPORT: {
          const mini360Dimensions = this.widgetCategories['Report'] && this.widgetCategories['Report'][0]
          && this.widgetCategories['Report'][0].mini360Dimensions;
          return {...this.transformReportConfig({...item, mini360Dimensions}), displayOrder: i};
        }
        default: {
          return {...this.transformStandardWidgetConfig(item), displayOrder: i };
        }
      }
    });
    return items;
  }

  transformAttributeWidgetConfig(config) {
    if (config && config.length) {
      const tempConfig = config.map((item) => {
        return this.transformFieldConfig(item);
      });
      tempConfig.sort((widget, prevWidget) => widget.axisDetails.x - prevWidget.axisDetails.x).sort((widget, prevWidget) => widget.axisDetails.y - prevWidget.axisDetails.y);
      return tempConfig;
    }
    return config;
  }

  // sample result of return by this method

  transformMultiObjectAttributeWidgetConfig(config:Array<{[key:string]:Array<any>}>) {
    if (config && Object.keys(config[0]).length) {
      const transformedConfig = Object.entries(config[0]).reduce((config, [objectName, fields]) => {
        config[objectName] = fields
          .map(item => this.transformFieldConfig(item))
          .sort((widget, prevWidget) => widget.axisDetails.x - prevWidget.axisDetails.x)
          .sort((widget, prevWidget) => widget.axisDetails.y - prevWidget.axisDetails.y);
        return config;
      }, {});

      return [transformedConfig];
    }
    return config;
  }

  transformFieldConfig(item, isFieldWidget?: boolean) {
    const { mini360Dimensions, baseObjectName,fieldName, displayName, itemId, label, dataType, objectName,objectLabel, properties, formatOptions, description, scale, fieldPath, widgetCategory, subType, category, x, y, rows, cols, maxItemCols, maxItemRows, minItemCols, minItemRows, widgetType, key, lookupDisplayField } = item as any;
    if (isFieldWidget) {
      return {
        label, widgetCategory, widgetType, subType, itemId, description,
        config: { fieldName, dataType, objectName,objectLabel, properties, formatOptions, scale, fieldPath, key, lookupDisplayField },
        dimensionDetails: { rows, cols, maxItemCols, maxItemRows, minItemCols, minItemRows },
        mini360Dimensions,
        axisDetails: { x, y }
      };
    }
    return {
      baseObjectName,fieldName, itemId, label, dataType, objectName,objectLabel, properties, formatOptions, description, scale, fieldPath, widgetCategory, subType, category, widgetType, key, lookupDisplayField,
      dimensionDetails: { rows, cols, maxItemCols, maxItemRows, minItemCols, minItemRows },
      mini360Dimensions,
      axisDetails: { x, y }
    };
  }

  transformReportConfig(item) {
    const { mini360Dimensions, widgetCategory, subType, label, config, x, y, rows, cols, itemId, widgetType, maxItemCols, maxItemRows, minItemCols, minItemRows } = item as any;
    return {
      label, widgetCategory, widgetType, subType, config, itemId,
      dimensionDetails: { rows, cols, maxItemCols, maxItemRows, minItemCols, minItemRows },
      mini360Dimensions,
      axisDetails: { x, y }
    };
  }

  transformStandardWidgetConfig(item) {
    let { mini360Dimensions, widgetCategory, subType, label, category, config, properties, x, y, rows, cols, itemId, widgetType, maxItemCols, maxItemRows, minItemCols, minItemRows, className='' } = item as any;
    if (WidgetItemSubType.ATTRIBUTE === subType) {
      config = this.transformAttributeWidgetConfig(config);
    }else if(WidgetItemSubType.MULTI_OBJECT_ATTRIBUTE === subType){
      config = this.transformMultiObjectAttributeWidgetConfig(config);
    }else if(isMultiObject(this.ctx) && subType === WidgetItemSubType.TEXT && config){
      config = {
        ...config,
        itemId: config.itemId || getFieldItemId(itemId,config.objectName,config.fieldName)
      }
    }
   if(WidgetItemSubType.CSM === subType){
    return {...this.transformFieldConfig({ ...item, ...item.config }, true)};
   }
    return {
      label, widgetCategory, category, widgetType, subType, config, itemId, className,
      dimensionDetails: { rows, cols, maxItemCols, maxItemRows, minItemCols, minItemRows },
      mini360Dimensions,
      axisDetails: { x, y }
    };


  }

  configureWidget(widgetItem: SummaryWidget) {
      this.widgetSettings = {
          ...this.widgetSettings,
          loading: true,
          open: true
      };
      this.loadWidgetSettingComponent(widgetItem);
      this.widgetName = widgetItem.config && widgetItem.config.label || widgetItem.label;
  }

  private async loadWidgetSettingComponent(widgetItem: any) {
    let widgetProvider:  AbstractWidgetProvider;
    let componentClass:any = this.widgetSettingRendService.getComponentClass(this.ctx.pageContext, widgetItem.subType);
    const widgetSettingsWidth = componentClass ? this.widgetSettingRendService.getComponentWidth(this.ctx.pageContext, widgetItem.subType) : null;
    if(!componentClass){
      widgetProvider = WidgetSettingProviderRegistry.getWidgetSettingProvider(widgetItem.subType);
      if (!widgetProvider) { console.error(`there is no setting provider for widget ${widgetItem.type} settings.`); return; }
      componentClass = await widgetProvider.getWidgetView();
    }
    if (!componentClass) { return; }
    const factory = this.cfr.resolveComponentFactory(componentClass);
    const viewContainerRef = this.hostRef.viewContainerRef;
    viewContainerRef.clear();
    if (this.widgetSettings.context.componentRef) {
      this.widgetSettings.context.componentRef.destroy();
    }
    this.widgetSettings.context.componentRef = viewContainerRef.createComponent(factory);
    const widgetInstance = (this.widgetSettings.context.componentRef.instance);
    widgetInstance.widgetItem = widgetItem || widgetItem.widgetElement;
    widgetInstance.ctx = this.ctx;
    widgetInstance.widgetItem.widgetMeta = new BehaviorSubject(null);
    widgetInstance.type = RENDER_TYPES.WIDGET_SETTINGS;
    widgetInstance.allFieldWidgets = this.allFieldWidgets;
    if (widgetInstance && widgetInstance.changes) {
      widgetInstance.changes.subscribe((changes) => {
          const payload = changes.payload && changes.payload.widgetElement ? changes.payload.widgetElement : changes.payload;
          this.subscribeToChanges(changes.type,payload);
      });
    }
    //todo need to check with backend if it can be part of bootstrap
    widgetItem.showNavigationOption = WidgetCategoryType.FIELD === widgetItem.widgetCategory && ![DataTypes.URL, DataTypes.RICHTEXTAREA].includes(widgetItem.dataType && widgetItem.dataType.toUpperCase());
    widgetItem.sectionScope = this.section.scope;
    widgetInstance.id = widgetItem.itemId;
    this.widgetSettings.widthPercentage = widgetSettingsWidth ? widgetSettingsWidth : (widgetProvider && widgetProvider.getWidgetSettingsWidth ? widgetProvider.getWidgetSettingsWidth() + "%" : "30%");
    this.widgetSettings.loading = false;
    this.widgetSettings.subType = widgetItem.subType;
  }

  closeSettings() {
    const { isValid, message, hasUnsavedChanges } = this.widgetSettings.context.componentRef.instance.toJSON();
    // if (!isValid) {
    //   this.showErrorMessage(message || APPLICATION_MESSAGES.SUMMARY_CONFIGURATION_EMPTY_DEFAULT_MESSAGE);
    // }
    if(this.widgetSettings.subType === "CUSTOMER_JOURNEY" && hasUnsavedChanges) {
      //{360.admin.journey_widget.title}=Are you sure you want to leave?
      //{360.admin.journey_widget.content}=Unsaved changes will be lost if you move out of this page.
      //{360.admin.journey_widget.save}=Save Changes
      //{360.admin.journey_widget.cancel}=Discard and leave
      this.modalService.confirm({
        nzTitle:  this.i18nService.translate('360.admin.journey_widget.title'),
        nzContent: this.i18nService.translate('360.admin.journey_widget.content'),
        nzOkText: this.i18nService.translate('360.admin.journey_widget.save'),
        nzCancelText: this.i18nService.translate('360.admin.journey_widget.cancel'),
        nzOnOk: () => {
          this.saveSettings();
        },
        nzOnCancel: () => {
          this.closeWidget();
        }
      });
    }else {
      this.closeWidget();
    }
  }

  closeWidget() {
    this.widgetSettings = {
      ...this.widgetSettings,
      loading: false,
      open: false
    };
    this.isSettingsSaveDisabled = false;
  }

  saveSettings() {
    const { id, label, config, isValid, message , configFieldName} = this.widgetSettings.context.componentRef.instance.toJSON();
    if (!(isValid === false)) {
      each(this.configuredWidgets, (widget: any) => {
        if (id === widget.itemId) {
          if (WidgetCategoryType.FIELD === widget.widgetCategory) {
            widget.description = config.description;
            widget.label = config.label;
            widget.config = config;
          }
          else if(WidgetCategoryType.STANDARD === widget.widgetCategory && WidgetItemSubType.CSM === widget.subType ){
            widget.label = label;
            widget.config = config;
            widget.config.fieldName = config.configFieldName ;
            widget.config.config.fieldName = config.configFieldName;
          }
           else {
            widget.label = label;
            widget.config = config;
            if(widget.widgetMeta){
              widget.widgetMeta.next(config);
            }
          }
         widget.axisDetails = {
            x: widget.x,
            y: widget.y
          }
        }
      });
      this.closeWidget();
    } else {
      this.showErrorMessage(message);
    }
    this.isConfigurationTouched = true;
  }

  showErrorMessage(message: string) {
    // this.toastMessageService.add(message || APPLICATION_MESSAGES.DEFAULT_ERROR_CONFIG_MESSGAE, MessageType.ERROR, null, { duration: 5000 });
    this.c360Service.createNotification('error',message || this.i18nService.translate('360.admin.APPLICATION_MESSAGES.DEFAULT_ERROR_CONFIG_MESSGAE'),5000);
  }

  trackWidget(index: number, item: SummaryWidget) {
    return item.itemId;
  }

  checkIsWidgetAlreadyExists(widget: SummaryWidget) {
    let isAlreadyExist = false;
    const { multiplesAllowed, widgetCategory, widgetType, subType, key, reportId, id } = widget as any;
    if (multiplesAllowed) {
      return isAlreadyExist;
    }

    switch (widget.widgetCategory) {
      case WidgetCategoryType.FIELD: {
        const searchedWidget = find(this.configuredWidgets, (item) => item.widgetCategory === widgetCategory && item.widgetType === widgetType && item.subType === subType && (item.key || (item.config && item.config.key)) === key);
        if (searchedWidget) {
          isAlreadyExist = true;
        }
        break;
      }
      case WidgetCategoryType.REPORT: {
        const searchedWidget = find(this.configuredWidgets, (item) => item.widgetCategory === widgetCategory && item.widgetType === widgetType && item.subType === subType && item.config.reportId === (id || reportId));
        if (searchedWidget) {
          isAlreadyExist = true;
        }
        break;
      }
      default: {
        const searchedWidget = find(this.configuredWidgets, (item) => item.widgetCategory === widgetCategory && item.widgetType === widgetType && item.subType === subType);
        if (searchedWidget && !multiplesAllowed) {
          isAlreadyExist = true;
        }
        break;
      }
    }

    if (isAlreadyExist) {
      // this.toastMessageService.add(APPLICATION_MESSAGES.DUPLICATE_WIDGET_NOT_ALLOWED, MessageType.WARN, null, { duration: 5000 });
      this.c360Service.createNotification('warning', this.i18nService.translate('360.admin.APPLICATION_MESSAGES.DUPLICATE_WIDGET_NOT_ALLOWED'),5000);
      return isAlreadyExist;
    }
  }

  saveInput(widget, $event) {
    if($event && $event.target){
      widget.tempLabel = $event.target.value.trim();
    }
    widget.label = widget.tempLabel.trim() === '' ?  widget.label : widget.tempLabel.trim();
    this.isConfigurationTouched = true;
    this.resetInput(widget);
  }

  resetInput(widget) {
    widget.showLabelInput = false;
    delete widget.tempLabel;
  }

  widgetChanged(event, grid) {

    // this method is being called on page load even though no changes are made from UI (maybe some internal changes are done so its emitting this). Also, grid.width is not present on initial load but present later when we rearrange any widget from UI.
    if(grid.width) {
      this.isConfigurationTouched = true;
    }
  }

}

