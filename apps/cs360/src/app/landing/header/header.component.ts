import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {CONTEXT_INFO, CS360CacheService, CS360Service, ICONTEXT_INFO, PageContext, QuickActionContext} from '@gs/cs360-lib/src/common';
import { StateAction } from '@gs/gdk/core';
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import {HeaderService, Relationship, RelationshipsByType} from "./header.service";
import { EnvironmentService } from '@gs/gdk/services/environment';
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';

@Component({
  selector: 'gs-cs360-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnChanges {

  public context: QuickActionContext;
  @Input() isPreview = false;
  @Input() snapshots: Array<any>;
  @Input() isNativeWidget: boolean;
  @Input() relationshipsByType: RelationshipsByType[];
  @Input() options: any;
  @Input() moduleConfig: any;
  @Input() isSsHaEnabled: boolean;

  @Output() relationshipChanged = new EventEmitter<{ id: string; pageContext: PageContext}>();
  @Output() hierarchyIconClicked = new EventEmitter();
  @Output() action = new EventEmitter<StateAction>();
  @Output() modalClose = new EventEmitter<boolean>();

  public entityId: string;
  public entityName: string;
  //public status: string;
  public statusClassName: string;
  public entityType: string;
  public showFollowButton: boolean = false;
  public headerLabel = "";
  public quickActions: {sectionType: string; label:string}[] = [];
  public subLabel;
  public subLabelstatus;
  public c360Link;
  public hierarchySectionId = "";
  private composerClose;
  public relationshipEnabled = false;
  public compStatusClassName;
  public relStatusClassName;
  public relDropdownValue;
  public compStatus;
  public relStatus;
  public isMini360 = false;
  listener = {
    meta: {
      contexts: []
    }
  };
  selectedField;
  logoLink;
  link;
  // modalInsatnce:any;

  featureFlags = this._env.gsObject.featureFlags;
  isSpaceAdminEnabled = false;
  // To hide quick CTA action based on FT and permission
  isCreateCtaGranularActionAllowed = this.featureFlags['COCKPIT_SUCCESS_PLAN_GRANULAR_ACTIONS'] ? this.c360Service.getCreateCtaGranularActionPermission() : true;

  constructor(private cS360CacheService: CS360CacheService,
    private c360Service: CS360Service,
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
    @Inject("envService") private _env: EnvironmentService,
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef
    ) {

    }

  ngOnInit() {
    const GS:any = this._env.getGS();
    // this.modalInsatnce = GS.drawerRef || '';
    this.isMini360 = isMini360(this.ctx);
    // this.isMini360 = GS.isMini360 || this.ctx.isOpenMini360;
    /*
    * Cannot rely on the GS.featureflags as they are cached and not updated when the user changes the feature flags
    * Hence making a call to fetch the space admin enablement when the user is idle
    */
    this.c360Service.fetchSpaceAdminEnablementWhenIdle().then((status) => {
      this.isSpaceAdminEnabled = status;
    });
  }

  ngAfterViewInit() {
    if(!this.isNativeWidget) {
      return;
    }
    const sally = document.querySelector("gs-inapp-sally");
    if(sally) {
        (sally as any).style.top = "1.5rem";
        document.querySelector(".sallyContainer").append(sally);
    }
  }

  ngOnChanges() {
    if(!this.moduleConfig) {
      return;
    }
    const { bootstrapConfig, layoutData } = this.moduleConfig;
    //this.status = layoutData.data.company_Status_PicklistLabel || layoutData.data.relationship_Status_PicklistLabel;
    this.compStatus = layoutData.data.company_Status_PicklistLabel || this.compStatus;
    this.relStatus =  layoutData.data.relationship_Status_PicklistLabel;
    this.relStatusClassName = layoutData.data.relationship_Status_PicklistLabel_SystemName;
    this.compStatusClassName = layoutData.data.company_Status_PicklistLabel_SystemName || this.compStatusClassName;
    this.quickActions = layoutData.quickActions;

    if (!this.isCreateCtaGranularActionAllowed){
      this.quickActions = this.quickActions.filter(action => action.sectionType !== "COCKPIT");
    }

    if(this.ctx.pageContext === PageContext.C360) {
      this.headerLabel = this.ctx.companyName;
      this.entityId = this.ctx.cId;
      this.relDropdownValue = 'cId-' + this.entityId;
      this.entityName = 'Company';
      this.entityType = PageContext.C360;
      this.selectedField = {
        label: this.ctx.companyName,
        value: this.ctx.cId,
        status: this.compStatus,
        statusClassName: this.compStatusClassName
      }
      this.setLogoLink(`customersuccess360?cid=${this.ctx.cId}`);
    } else if(this.ctx.pageContext === PageContext.R360) {
      this.subLabel = this.ctx.companyName;
      //this.subLabelstatus = this.status;
      this.c360Link = HybridHelper.generateNavLink(`customersuccess360?cid=${this.ctx.cId}`);
      this.setLogoLink(`relationship360?rid=${this.ctx.rId}`);
      this.headerLabel = this.ctx.relationshipName;
      this.entityId = this.ctx.rId;
      this.relDropdownValue = this.entityId;
      this.selectedField = {
        label: this.ctx.relationshipName,
        value: this.ctx.rId,
        status: this.relStatus,
        statusClassName: this.relStatusClassName
      }
      this.entityName = 'Relationship';
      this.entityType = PageContext.R360;
    }
    const hierarchySection = layoutData.layout.sections.find(x => x.sectionType === "COMPANY_HIERARCHY");
    if(hierarchySection) {
      this.hierarchySectionId = hierarchySection.sectionId;
    }
    this.showFollowButton = this.isNotificationServiceEnabled(bootstrapConfig);

    this.relationshipEnabled = this._env.gsObject.isRelationshipEnabled;
  }

  close(){
    this.modalClose.emit(true)
  }

  private setLogoLink(link) {
		this.logoLink = HybridHelper.generateNavLink(link);
	}

  onHierarchyIconClick() {
    this.hierarchyIconClicked.emit({type: "HIERARCHY_ICON_CLICKED", sectionId: this.hierarchySectionId});
  }

  openExternalLayouts() {
    const GS = this._env.gsObject;
    const link = this.entityType == "C360" ?
      HybridHelper.generateNavLink("externallayoutspreview?cid="+GS.companyId):
      HybridHelper.generateNavLink("externallayoutspreview?rid="+GS.relationshipId);
    HybridHelper.navigateToURL(link, true);
  }

  onAction(type: string) {
    const timelineEvents = (window as any).timelineEvents;
    const isComposerOpened = timelineEvents && timelineEvents.isComposerOpened && timelineEvents.isComposerOpened();
    if(isComposerOpened) {
      timelineEvents.saveAsDraft();
      timelineEvents.tgs[0].unSubscribe("COMPOSER_CLOSED", this.composerClose, this.listener);
      timelineEvents.tgs[0].unSubscribe("DRAFT_FAILED", this.onDraftFail, this.listener);
      this.composerClose = this.onComposerClose.bind(this, type);
      timelineEvents.tgs[0].subscribe("COMPOSER_CLOSED", this.composerClose, this.listener);
      timelineEvents.tgs[0].subscribe("DRAFT_FAILED", this.onDraftFail, this.listener);
    } else {
      this.proceedToLoadSection(type);
    }
  }

  onShareAction(evt: StateAction) {
    switch (evt.type) {
      case 'VERT_SCROLL_CHANGE':
        this.action.emit(evt);
        break;
      default: null
    }
  }

  onDraftFail() {
    (window as any).timelineEvents.tgs[0].unSubscribe("COMPOSER_CLOSED", this.composerClose, this.listener);
    (window as any).timelineEvents.tgs[0].unSubscribe("DRAFT_FAILED", this.onDraftFail, this.listener);
  }

  onComposerClose(type) {
    const timelineEvents = (window as any).timelineEvents;
    timelineEvents.tgs[0].unSubscribe("COMPOSER_CLOSED", this.composerClose, this.listener);
    timelineEvents.tgs[0].unSubscribe("DRAFT_FAILED", this.onDraftFail, this.listener);
    setTimeout(() => this.proceedToLoadSection(type));
  }

  proceedToLoadSection(type: string) {
    this.context = null;
    this.cdr.detectChanges();
    this.context = {
      id: 'new', //getUniqueId(),
      type,
      show: true,
      save: this.save.bind(this),
      title: `Add ${type}`,
      cancel: this.cancel.bind(this),
      data: this.cS360CacheService.getCacheByKey('new') //todo need to remove
    } as QuickActionContext;
    this.cdr.detectChanges();
  }

  isNotificationServiceEnabled(bootstrapConfig: any[]): boolean {
    return bootstrapConfig['feature-toggle'].some(f => f.featureName === "messenger" && f.value);
  }

  save(context) {
    const { id, data } = context;
    this.cS360CacheService.updateCache(id, data);
  }

  cancel(id) {
    this.cS360CacheService.updateCache(id, {});
  }

  get allowAddPersonAction(): boolean{
    const sections = this._env.moduleConfig.sections;
    let personSectionConfig = null;
    if(sections && sections.length){
      const personSection = this._env.moduleConfig.sections.filter((section)=>section.sectionType === "PERSON");
      if(personSection && personSection.length){
        personSectionConfig = personSection[0].config ? JSON.parse(personSection[0].config) : null;
      }
    }
    return (personSectionConfig && personSectionConfig.AdditionalConfiguration && personSectionConfig.AdditionalConfiguration.hasOwnProperty("allowAddPerson")?
      personSectionConfig.AdditionalConfiguration.allowAddPerson : true);
  }

  /**
   *
   * @param id cId or rId
   */
   navigateToCR360(id) {
    let payload;
    if(id === this.ctx.cId) {
      payload = {
        id,
        pageContext: PageContext.C360
      }
      this.selectedField = {
        label: this.ctx.companyName,
        value: this.ctx.cId,
        status: this.compStatus,
        statusClassName: this.compStatusClassName
      };
    } else {
      payload = {
        id: id,
        pageContext: PageContext.R360,
      }
      const selectedRelationship: Relationship = this.getRelationshipById(id);
      if(selectedRelationship) {
        this.selectedField = {
          label: selectedRelationship.name,
          value: selectedRelationship.gsid,
          status: selectedRelationship.status_PicklistLabel,
          statusClassName: selectedRelationship.status_PicklistLabel_SystemName
        };
      }
    }
    this.relationshipChanged.emit(payload);
  }

  private getRelationshipById(rid): Relationship {
    return this.relationshipsByType.reduce((prev, curr) => prev.concat(curr.relationships), []).find(item => item.gsid === rid);
  }

  openInNewTab(): void {

    if(this.ctx.pageContext === PageContext.C360) {
      this.link = HybridHelper.generateNavLink(`customersuccess360?cid=${this.ctx.cId}`);

    } else if(this.ctx.pageContext === PageContext.R360) {
      this.link = HybridHelper.generateNavLink(`relationship360?rid=${this.ctx.rId}`);
    }
    if(HybridHelper.isSFDCHybridHost()){
      HybridHelper.navigateToURL(this.link, true);
    } else {
      window.open(this.link, '_blank');
    }
  }

  onGoToSpace() {
    const pageContextUrlMap = {
      [PageContext.C360]: `space?cid=${this.ctx.cId}`,
      [PageContext.R360]: `space?rid=${this.ctx.rId}`
    };
    const link = HybridHelper.generateNavLink(pageContextUrlMap[this.ctx.pageContext]);
    if(HybridHelper.isSFDCHybridHost()){
      HybridHelper.navigateToURL(link, true);
    } else {
      window.open(link, '_blank');
    }
  }
}
