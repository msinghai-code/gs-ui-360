import {
  Component,
  ComponentFactoryResolver,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import {
  GridsterItem,
  GridsterItemComponentInterface,
  GridsterConfig,
  GridsterComponent,
  GridsterPush, GridsterItemComponent
} from 'angular-gridster2';
import {forkJoin, from, noop} from 'rxjs';
import {take, tap} from 'rxjs/operators';
import { WidgetItem } from '@gs/gdk/widget-viewer';
import { GSEvents, GSEventBusService } from "@gs/gdk/core";
import { NzDropDownComponent } from "@gs/ng-horizon/dropdown";
import { AbstractWidgetProvider } from '../../../csm-widgets/providers/CSMAbstractWidgetProvider';
import { WidgetProviderRegistry } from '../../../csm-widgets/csm-widget-registry';
import { CsmSummaryService, PreviewCtx } from './csm-summary.service';
import {
    ISection,
    SUMMARY_GRIDSTER_DEFAULTS,
    CS360CacheService,
    EventType,
    Redirections,
    WidgetCategoryType,
    WidgetEvent,
    WidgetItemSubType,
    CS360Service,
    CONTEXT_INFO,
    ICONTEXT_INFO,
    MDA_HOST,
    getRowsForAttributeWidget, SectionStateService, isMini360, MiniPrefix, PxService
} from '@gs/cs360-lib/src/common';
import { Router } from '@angular/router';
import { SubSink } from 'subsink';
// import {MDA_HOST} from "../../../cs360.utils";
// import {Cs360ContextUtils} from "../../../cs360.context";
import { isEmpty, cloneDeep} from "lodash";
import {CSMAttributeService} from "../csm-attribute/csm-attribute.service";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { BaseCsmWidgetRendererService } from './base-csm-widget-renderer/base-csm-widget.service';
// import { CS360Service } from '../../../shared/services/cs360.service';
import { DescribeService } from "@gs/gdk/services/describe";

const COMPACT_NO_EDIT_WIDGETS = new Set([WidgetItemSubType.IMAGE]);

@Component({
  selector: 'gs-csm-summary',
  templateUrl: './csm-summary.component.html',
  styleUrls: ['./csm-summary.component.scss']
})
export class CsmSummaryComponent implements OnInit, OnChanges {
  @ViewChildren(GridsterItemComponent) gridsterItemComponentArray: GridsterItemComponent[];

  @ViewChild("gridster", {static: false}) gridster: GridsterComponent;
  @ViewChild("ddMenu", {static: false}) ddMenu: NzDropDownComponent;
  @Input() section: ISection;
  @Input() moduleConfig = null;
  @Input() previewCtx: PreviewCtx;
  @Input() isPreview: boolean = false;
  options: GridsterConfig = SUMMARY_GRIDSTER_DEFAULTS.GRIDSTER_CSM_VIEW();
  widgets: WidgetItem[] = [];
  redirect = {};
  MOBILE_BREAKPOINT = 570;
  isTooltipVisible = false;
  subsink = new SubSink();
  loaded: boolean = false;
  treeData;
  treeOptions = {
    selectionMode: "checkbox",
    selection: [],
    filterBy: "label"
  }
  selectedWidgets: WidgetItem[] = [];
  showChooser: boolean;
  isMini360: boolean;

  constructor(@Inject("envService") protected env: EnvironmentService,
              protected cfr: ComponentFactoryResolver,
              private renderer: Renderer2,
              private c360Service: CS360Service,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              protected viewContainerRef: ViewContainerRef,
              private csmSummaryService: CsmSummaryService,
              private cS360CacheService: CS360CacheService,
              private router: Router,
              private eventService: GSEventBusService,
              private baseCsmWidgetRendererService: BaseCsmWidgetRendererService,
              public attrService: CSMAttributeService, private _ds: DescribeService,
              protected stateService: SectionStateService,
              public pxService: PxService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isPreview) {
      this.csmSummaryService.setPreviewMode();
    }
    this.resetSummarySubscriptions();
  }

  async resetSummarySubscriptions() {
    await this.setWidgets();
  }

  async ngOnInit() {
    this.isMini360 = isMini360(this.ctx);
    this.options = {
      ...this.options,
      scrollToNewItems: false,
      itemResizeCallback: this.onResize.bind(this),
      mobileBreakpoint: this.MOBILE_BREAKPOINT,
      fixedRowHeight: this.isMini360 ? 24 : this.options.fixedRowHeight
    };
    await this.resetSummarySubscriptions();
    this.subscribeForEvent();
    this.identifyRedirections();
  }

  subscribeForEvent() {
    this.setWidgetSubject();
    let entityId;
    if(this.previewCtx) {
      // entityId = this.previewCtx.pageContext === PageContext.C360 ? this.previewCtx.cId : this.previewCtx.rId;
      entityId = this.previewCtx[this.previewCtx.previewConfig.previewKey]; // need to test this

    } else {
      entityId = this.cS360CacheService.getModuleContextId(this.ctx);
    }
    const layoutId = this.section.layoutId;
    const sectionId = this.section.sectionId;
    const serviceCtx = this.isPreview ? this.previewCtx : this.ctx;
    this.csmSummaryService.setCtx(serviceCtx);

        this.subsink.add(this.csmSummaryService.onAction.subscribe((event: WidgetEvent) => {
                let { eventType, contextCategory, message, data, entityType, dataEditEntityId, multiAttributeData, widget } = event as any;

          switch (eventType as EventType) {
            case EventType.REFRESH: {
              // this.csmSummaryService.getDataForWidgetType(contextCategory, { entityId, layoutId, sectionId, objectName: (this.ctx.pageContext === 'C360' ? 'COMPANY' : 'RELATIONSHIP') });
              const objectName = this.ctx.baseObject.toUpperCase();
              this.csmSummaryService.getDataForWidgetType(contextCategory, {entityId, layoutId, sectionId, objectName});

              break;
            }
            case EventType.ERROR: {
              // this.toastMessageService.add(message, MessageType.ERROR, null, { duration: 5000 });
              this.c360Service.createNotification('error', message, 5000);
              this.csmSummaryService.refreshWidgetType(contextCategory);
              break;
            }
            case EventType.SAVE: {
              entityId = event.entityId ? event.entityId : entityId;
              dataEditEntityId = event.dataEditEntityId ? event.dataEditEntityId : entityId;
              entityType = event.entityType ? event.entityType : entityType;
              this.csmSummaryService.saveAndGetDataForWidgetType({
                entityId,
                layoutId,
                sectionId,
                entityType,
                dataEditEntityId,
                data,
                multiAttributeData
              });
              break;
            }
            case EventType.RESIZE: {
              const gridsterItem = this.selectedWidgets.find(w => w["itemId"] === widget.itemId);
              this.resizeItem(data, gridsterItem);
              break;
            }
          }
        }
    ));
  }

  private setWidgetSubject() {
    // In the `setWidgetSubject` method, we need `previewCtx` to be set, but it was earlier only in the `else` part.
    // Due to this, if a widget like Success Plan is the first in the array, the whole preview won't load.
    // However, if it's at the end, it will load other widgets and Success Plan will be empty.
    const serviceCtx = this.isPreview ? this.previewCtx : this.ctx;
    this.csmSummaryService.setCtx(serviceCtx);
    let entityId;
    if (this.previewCtx) {
      // entityId = this.previewCtx.pageContext === PageContext.C360 ? this.previewCtx.cId : this.previewCtx.rId;
      entityId = this.previewCtx[this.previewCtx.previewConfig.previewKey]; // need to test this

    } else {
      entityId = this.cS360CacheService.getModuleContextId(this.ctx);
    }
    const layoutId = this.section.layoutId;
    const sectionId = this.section.sectionId;

    this.csmSummaryService.setSubjectForSectionWidgets(this.selectedWidgets, entityId, layoutId, sectionId, this.section.selectedCompanyId, this.section);
  }

  resizeItem({fields, viewAll, data}, widget) {
    const gridsterItemComponent = this.gridsterItemComponentArray.find((e, i) => i === this.selectedWidgets.findIndex(w => w["itemId"] === widget.itemId));
    let rows = getRowsForAttributeWidget(data);
    widget.rows = rows;
    widget.minItemRows = rows;
    gridsterItemComponent.item.dimensionDetails = {...gridsterItemComponent.item.dimensionDetails, rows, minItemRows: rows};
    this.options.draggable = {...this.options.draggable, enabled: true}; //needed to push items down
    this.options.api.optionsChanged();
    this.pushItem(gridsterItemComponent);
  }
  pushItem(item): void {
    const push = new GridsterPush(item); // init the service
    if (push.pushItems(push.fromNorth)) { // push items from a direction
      push.pushItems(push.fromNorth);
      push.setPushedItems(); // save the items pushed
      push.restoreItems(); // restore to initial state the pushed items
      push.checkPushBack(); // check for items restore to original position
      this.options.api.resize();
    } else {
      /**this.itemToPush.$item.rows -= 4;
       push.restoreItems();*/ // restore to initial state the pushed items
    }
    push.destroy(); // destroy push instance
    this.options.draggable = {...this.options.draggable, enabled: false};
    this.options.api.optionsChanged();
  }

  async setWidgets() {
    await this.populateTreeData();
    const configuredSections = this.section && this.section.config ? this.section.config.widgets : [];
    this.widgets = configuredSections.map((widgetItem: any) => {
      if (widgetItem.dimensionDetails) {
        widgetItem.dimensionDetails.rows = widgetItem.rows ? widgetItem.rows : widgetItem.dimensionDetails.rows;
        widgetItem.dimensionDetails.cols = widgetItem.cols ? widgetItem.cols : widgetItem.dimensionDetails.cols;
        if (widgetItem.axisDetails) {
          widgetItem.axisDetails.x = widgetItem.hasOwnProperty('x') ? widgetItem.x : widgetItem.axisDetails.x;
          widgetItem.axisDetails.y = widgetItem.hasOwnProperty('y') ? widgetItem.y : widgetItem.axisDetails.y;
        }
      }
      widgetItem.className = widgetItem.className || '';
      // Make widgets as uneditable for zoom, zendesk etc
      if (this.ctx.isCompact && COMPACT_NO_EDIT_WIDGETS.has(widgetItem.subType) && widgetItem && widgetItem.config && widgetItem.config.properties && widgetItem.config.properties.editable) {
        widgetItem.config.properties.editable = false;
      }
      return {
        ...widgetItem,
        ...widgetItem.axisDetails,
        ...widgetItem.dimensionDetails,
        initCallback: this.loadWidget.bind(this),
        supportedInSmallScreen: this.isSupportedInSmallScreen(widgetItem)
      }
    });
    this.selectedWidgets = this.getSelectedWidgets();
  }

    public async populateTreeData(){
        // In case of summary preview, ctx would be empty. Need to figure out how to alter ctx in this case. Till then applying null check
        if(isEmpty(this.ctx)) {
            this.loaded = true;
            return;
        }
        // Populating tree data from here and passing it to the child components for checking mapped field
        if(this.ctx.associatedObjects && this.ctx.associatedObjects.length){
          forkJoin([this.ctx.baseObject,...this.ctx.associatedObjects].map((object)=>{
            return from(this._ds.getObjectTree(MDA_HOST, object, 2, null,
                  { includeChildren: false, skipFilter: true}))
            })).pipe(
            tap((objects)=>{
              const multiObjOpts = (objects.map((item)=>item.children) as any).flat();
              this.treeData = {'children': multiObjOpts };
              this.attrService.treeData = this.treeData;
              this.loaded = true;
            })).subscribe();
        }else{
          let data = await this._ds.getObjectTree(MDA_HOST, this.ctx.baseObject, 2, null, {skipFilter: true});
          this.treeData = data;
          this.attrService.treeData = this.treeData;
          this.loaded = true;
        }
    }
  isSupportedInSmallScreen(widget) {
    if( widget.subType === WidgetItemSubType.REPORT) {
      return widget.config && ['KPI'].includes(widget.config.visualizationType)
    }
    return ![
      WidgetItemSubType.CUSTOMER_JOURNEY,
      WidgetItemSubType.TIMELINE,
      WidgetItemSubType.HEALTH_SCORE_METRIC_AND_HISTORY,
      WidgetItemSubType.ARR_WITH_HISTORY
    ].includes(widget.subType);
  }

  async loadWidget(e, itemComponent: GridsterItemComponentInterface) {
    const { item } = itemComponent;
    const widgetComponentClass = this.baseCsmWidgetRendererService.getComponentClass(this.isPreview ? this.previewCtx.pageContext : this.ctx.pageContext,item.widgetType);
    if(this.ctx.isCompact && !item.supportedInSmallScreen && !this.ctx.containerResizable) {
      // console.log('%cNOT SUPPORTED, removing', 'font-size: 20px; color:red', item)
      return;
    }

    let componentClass = null;
    if(widgetComponentClass){
      componentClass = widgetComponentClass;
    }
    else {
      const subType = this.getSubTypeForWidget(item);
      const widgetProvider: AbstractWidgetProvider = WidgetProviderRegistry.getWidgetProvider(subType);
      if (!widgetProvider) { console.error(`there is no provider for widget subType : ${subType}`); return; }
      componentClass = await widgetProvider.getWidgetView('CSM');
      if (!componentClass) { return; }
    }
    const factory = this.cfr.resolveComponentFactory(componentClass);
    const ref = this.viewContainerRef.createComponent(factory);
    const widgetInstance = (ref.instance as any);
    widgetInstance.destroy = () => ref.destroy();
    widgetInstance.widgetItem = item;
    widgetInstance.moduleConfig = this.moduleConfig;
    widgetInstance.layoutId = this.section.layoutId;
    widgetInstance.isCsm = true;
    widgetInstance.ctx = this.isPreview ? this.previewCtx : this.ctx;
    ref.changeDetectorRef.detectChanges();
    widgetInstance.element = ref.location.nativeElement;
    itemComponent.el.appendChild(widgetInstance.element);
    this.renderer.setAttribute(widgetInstance.element, 'class', 'widget-csm-element');
  }

  getSubTypeForWidget(item) {
    switch (item.widgetCategory) {
      case WidgetCategoryType.FIELD: {
        if (item.config.dataType === 'IMAGE') {
          return WidgetItemSubType.IMAGE;
        }
        return WidgetItemSubType.FIELD;
      }
      case WidgetCategoryType.REPORT: {
        return WidgetItemSubType.REPORT;
      }
      default: {
        return item.subType;
      }
    }
  }

  identifyRedirections() {
    const moduleConfig = this.env.moduleConfig;
    const sections = moduleConfig && moduleConfig.sections;
    if (sections) {
      this.selectedWidgets.forEach(widget => {
        const sectionToRedirect = Redirections[widget.subType] && sections.find(section => section.sectionType === Redirections[widget.subType]);
        if (sectionToRedirect) {
          this.redirect[widget.subType] = sectionToRedirect.sectionId;
        }
      })
    }
  }

  onResize(item: GridsterItem){
    const payload = {
      type: GSEvents.GRIDSTERRESIZE,
      sourceId: item.itemId,
      payload: {}
    };
    this.eventService.emit(payload);
  }

  redirectTo(sectionId: string, event) {
    if(event.target && event.target.classList.contains('widget_container')) {
      return false;
    }
    if (this.isMini360) {
      this.cS360CacheService.navigateToTab({}, null, null, sectionId);
    } else {
      sectionId && this.router.navigate([`/${sectionId}`]);
    }
  }

  tooltipVisible(evt) {
    this.isTooltipVisible = evt;
  }

  ngOnDestroy(){
    this.subsink.unsubscribe();
  }

  applyColumnSelection($event: any) {
    this.pxService.pxAptrinsic('summary_widgets_saved',{source: 'mini'});
    this.selectedWidgets = this.widgets.filter(widget => $event.value.includes(widget["itemId"]));
    this.setWidgetSubject();
    this.identifyRedirections();
    this.saveState({selectedWidgets: $event.value});
    this.ddMenu.setVisibleStateWhen(false);
  }

  cancelColumnSelection($event: any) {
    this.ddMenu.setVisibleStateWhen(false);
  }

  setShowChooser() {
    this.showChooser = !this.showChooser;
    this.ddMenu.visible$.pipe(take(1)).subscribe((visible) => {
      this.showChooser = visible;
    })
  }

  private getSelectedWidgets() {
    let selectedWidgets = cloneDeep(this.widgets);
    if (this.isMini360) {
      const selectedWidgetIds = this.section.state && this.section.state.state && this.section.state.state.miniConfig && this.section.state.state.miniConfig.selectedWidgets
      if (selectedWidgetIds) {
        const selectedWidgetsFromState = selectedWidgets.filter(widget => selectedWidgetIds.includes(widget.itemId));
        if (selectedWidgetsFromState.length > 0) {
          selectedWidgets = selectedWidgetsFromState;
        }
      }
    }
    return selectedWidgets;
  }

  private saveState(customization) {
    let payload = this.section.state;
    let state = {
      miniConfig: customization
    };
    if (!isEmpty(payload) && !isEmpty(payload.state)) {
      state = {
        ...payload.state,
        miniConfig: payload.state.miniConfig ? {...payload.state.miniConfig, ...customization} : customization
      }
    }
    const pageContext = this.ctx.pageContext && this.ctx.pageContext.toLowerCase()
    payload = {
      referenceId: `${this.section.layoutId}_${this.section.sectionId}`,
      moduleName: (MiniPrefix+ pageContext).toLowerCase(),
      gsEntityId: "default",
      state
    };
    this.stateService.saveState(payload).pipe(take(1)).subscribe(noop);
  }
}
