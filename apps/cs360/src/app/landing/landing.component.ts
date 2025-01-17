import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Pipe,
    PipeTransform,
    ViewChild,
    HostListener
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { StateAction } from '@gs/gdk/core';
import { IntersectionStatus } from '@gs/gdk/widget-viewer/gs-intersection-observer/from-intersection-observer';
import { fromEvent } from "rxjs";
import { cloneDeep, orderBy } from 'lodash';
import { debounceTime, throttle } from "rxjs/operators";
import {
  SectionRendererService,
  ISection,
  PinnedSection,
  CS360Service,
  CS360CacheService,
  CONTEXT_INFO,
  ICONTEXT_INFO,
  PageContext,
  SECTION_EVENTS, formMiniSectionsConfig
} from '@gs/cs360-lib/src/common';
import { ManageSectionsComponent } from '@gs/cs360-lib/src/csm';
import { find, groupBy, uniqBy } from 'lodash';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { RelationshipsByType } from './header/header.service';
import { animate, style, transition, trigger } from '@angular/animations';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { MessageType } from '@gs/gdk/core';
import { isMini360, miniEmptyScreenSections } from '@gs/cs360-lib/src/common/cs360.utils';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-cs360-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({opacity: 0.3, transform: 'scale(0.5)' }),
        animate(200, style({opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(100, style({opacity: 0.3, transform: 'scale(0.5)' }))
      ])
    ])
  ]
})
export class LandingComponent implements OnInit, AfterViewInit {
  // TODO: Will be fetch from backend.
  public sections: ISection[];
  public showManageSections: boolean = false;
  public moreVisible: boolean = false;
  public scrollContainer = null;
  public loadAll = false;
  public visibilityStatus = {};
  public isNativeWidget: boolean = false;
  public selectedTabIndex = 0;
  public snapshots: Array<any> = [];
  public noSectionsPinned = false;
  public relationshipsByType: RelationshipsByType[] = [];
  public showTabView = true;
  public ignoreInactive;
  public isSsHaEnabled;
  @ViewChild(ManageSectionsComponent, { static: false }) manageSections: ManageSectionsComponent;
  @ViewChild('vertScrollElem', { static: false }) vertScrollElem: any;
  isSaveInProgress: boolean;
  sectionId: string;
  moduleConfig: any;
  isMini360: boolean = false;
  notAvailableSectionForInMini360 = [];

  @Input() sectionTypeToLoad: string;
  @Input() hideHeader = false;
  @Input() fontFamily?: any = 'cursive';
  @Output() sectionChanged = new EventEmitter<string>();
  @Output() modalClose = new EventEmitter<boolean>();


  loadHeader: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
    private srs: SectionRendererService,
    @Inject("envService") private env: EnvironmentService,
    public c360Service: CS360Service,
    public c360CacheService: CS360CacheService,
    private ele : ElementRef,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private i18nService: NzI18nService
    ) {
    this.sectionId = this.activatedRoute.snapshot.paramMap.get('sectionId');
  }

  ngOnInit() {
    this.isMini360 = isMini360(this.ctx);
    this.c360Service.checkForSsHaEnablement().subscribe((response: any) => {
      if(response.success) {
        this.isSsHaEnabled = response.data.value === 'ENABLED';
      }
    });

    // Fetch Create CTA permission from COCKPIT_GRANULAR_ACTION Resource
    this.c360Service.fetchCreateCtaGranularActionPermission().subscribe((response) => {
      if (response.data){
        const config = response.data.userResourceDTOS;
        if(config.length === 0){
          this.c360Service.setCreateCtaGranularActionPermission(false);
        } else {
          this.c360Service.isSuperAdmin = config[0].superAdmin;
          const createCtaPermission = config[0].superAdmin || (config[0].actionDetailsMap && config[0].actionDetailsMap.hasOwnProperty('create_cta'));
          this.c360Service.setCreateCtaGranularActionPermission(createCtaPermission);
        }
      }
      this.loadHeader = true;
    })

    // Get srcollView.
    const featureFlags = this.env.gsObject.featureFlags;
    this.ignoreInactive = featureFlags && featureFlags.SS_HA_ENABLEMENT === 'ENABLED';
    this.scrollContainer = document.querySelector(".gs-ng-container.gs-module-container");
    // Get Sections for the layouts
    this.getSections(!this.sectionId);
    this.showTabView = this.ctx.isSmartWidget ? this.sections && this.sections.length > 1 : true;
    // Get scroll view info
    this.getScrollViewInfo();
    this.c360Service.getSuccessSnapshots().subscribe((snapshots) => {
      let showEntity = this.ctx.pageContext === PageContext.C360 ? 'ACCOUNT': 'RELATIONSHIP';
      snapshots.data.forEach((snapshot) => {
        if (snapshot.entity.toUpperCase() === showEntity && snapshot.pptId && (this.isSsHaEnabled || this.ignoreInactive || !snapshot.inactive)) {
          this.snapshots.push(snapshot);
        }
      })
    });
    this.subscribeToRouteChange();
    this.subscribeToSwitch360();

    this.moduleConfig = this.env.moduleConfig;

    if(this.isNativeWidget) {
      this.c360Service.queries(`relationship`, {
        select: ["gsid", "name", "typeId", "typeId.Name AS typeName", "status"],
        where: {
          expression: "A",
          conditions: [
            {
                name: "CompanyId",
                alias: "A",
                value: [this.ctx.cId],
                operator: "EQ"
            }
          ]
        },
        includePicklistSystemName : true
      }).subscribe(res => {
        if(res.result) {
          const options = res.data.records;
          const groupedOptions = groupBy(options, 'typeName');
          Object.keys(groupedOptions).forEach(type => {
            this.relationshipsByType.push({
              type,
              relationships: groupedOptions[type]
            })
          });
        }
      });
    }
  }

    @HostListener('window:LAUNCH_MINI_360')
    onCompanyNameClick() {
      if(this.isMini360) {
          this.c360CacheService.navigateToTab(this.sections[0].sectionType);
      }
     }

  onModalClose(evt:boolean){
    this.modalClose.emit(evt);
  }

  private subscribeToSwitch360() {
    if(!this.ctx.isSmartWidget && !this.ctx.isNativeWidget) {
      return;
    }
    this.c360Service.getSwitch360SubjectAsObservable().subscribe(payload => {
      this.navigateToCR360(payload);
    })
  }

  getSections(loadDefault = false) {
    const moduleConfig = this.env.moduleConfig;
    this.sections = uniqBy(moduleConfig.sections, section => section.sectionId);

    this.notAvailableSectionForInMini360 = miniEmptyScreenSections(cloneDeep(this.sections), this.isMini360)

    if(!this.sections.filter(item => item.pinned).length) {
      this.noSectionsPinned = true;
    } else{
      this.noSectionsPinned = false;
    }
    this.isNativeWidget = moduleConfig.isNativeWidget==='true';

    if(loadDefault && this.sections.length) {
      let sectionId = this.sectionTypeToLoad && this.getSectionIdByType(this.sectionTypeToLoad);
      this.sectionId = sectionId || moduleConfig.sections[0].sectionId;
       if(!this.isMini360){
        this.router.navigate(['/' + this.sectionId]);
      }
    }
    const sectionToLoad = find(this.sections, s => s.sectionId === this.sectionId) as ISection;
    // this.markFirstUnpinnedSection(this.sections);
    if(sectionToLoad && !sectionToLoad.isLoaded) {
      this.srs.setSectionToRender(sectionToLoad);
    }

    const sectionType = this.getSectionTypeById(this.sectionId);

    // emitting even when there are no sections to load
    this.sectionChanged.emit(sectionType);
  }

  getSectionIdByType(sectionType) {
    if(!sectionType) return;

    const section = find(this.sections, s => s.sectionType === sectionType);
    return section && section.sectionId;
  }

  getSectionTypeById(sectionId) {
    if(!sectionId) return;

    const section = find(this.sections, s => s.sectionId === sectionId);
    return section && section.sectionType;
  }

  private subscribeToRouteChange() {
    this.srs.getTabSelectAsObservable().subscribe((sectionId) =>  {

      this.handleSectionChange(sectionId);
    })
    this.router.events.subscribe((val) => {
      if(val instanceof NavigationStart) {
        this.handleSectionChange(val.url.slice(1));
      }
    });
  }

  private handleSectionChange(sectionId) {
    this.dispatchEventToSections(sectionId);
    const sectionMeta = this.c360Service.sectionMetaMap[this.sectionId];
    if (sectionMeta) {
      sectionMeta.unread = 0;
    }

    this.sectionId = sectionId;
    this.selectedTabIndex = this.sections.findIndex(sec => sec.sectionId === this.sectionId);
    const section = this.sections[this.selectedTabIndex < 0 ? 0 : this.selectedTabIndex] as any;
    this.sections.forEach((s: any) => {
      s.tempPinned = false;
    });
    if (!section.pinned) {
      section.tempPinned = true;
      this.cdr.detectChanges();
      if (!section.isLoaded) {
        this.srs.setSectionToRender(section);
      }
    } else {
      // this.markFirstUnpinnedSection(this.sections)
    }
    this.scrollToSectionView();
    setTimeout(() => {
      this.positionMoreIcon();
    }, 0);
  }

  dispatchEventToSections(sectionId){
    const event:Event = new CustomEvent("360SectionChanged", { detail: {sectionId} });
    window.dispatchEvent(event);
  }

  ngAfterViewInit() {
    this.positionMoreIcon();
    this.scrollToSectionView();
    this.attachScrollEventListener();
  }

  getScrollYPositionAndHighlightTab(e: any): void {
    const sections = e.target.children;
    const scrollTop = (e.target as Element).scrollTop + sections[0].offsetTop + 100;
    for (let i = 0; i < sections.length; i++) {
      const sHeight = sections[i].offsetHeight;
      const offset = sections[i].offsetTop;
      if (scrollTop > offset && scrollTop < offset + sHeight) {
        this.selectedTabIndex = this.sections.findIndex(sec => sec.sectionId === sections[i].id);
        if(this.sectionId !== sections[i].id) {
          this.location.go(`/${sections[i].id}`);
        }
      }
    }
  }

  positionMoreIcon() {
    if(this.ctx.hidePinUpin) {
      return;
    }

    const moreEle = (this.ele.nativeElement.querySelector(".ant-tabs-extra-content") as HTMLElement);
    if(this.ele.nativeElement.querySelector(".ant-tabs-tab-arrow-show")) {
      moreEle.style.position = "relative";
      moreEle.style.left = "0px";
    } else {
      moreEle.style.position = "absolute";
      const navRect = this.ele.nativeElement.querySelector('.ant-tabs-nav').getBoundingClientRect();
      const total = navRect.width;
      (this.ele.nativeElement.querySelector(".ant-tabs-extra-content") as HTMLElement).style.left = coerceCssPixelValue(total)
    }
  }

  onTabSelect(section: ISection): void {
    if(this.selectedTabIndex === this.sections.findIndex(sec => sec.sectionId === section.sectionId)) {
      return;
    }
    // this.sectionId = section.sectionId;
    if (!section.isLoaded) {
      section.isLoaded = true;
      this.srs.setSectionToRender(section);
    }
    /* needs to be done explicitly for mini because in main, it is handled by router change event. See `subscribeToRouteChange`*/
    if(this.isMini360) {
      this.handleSectionChange(section.sectionId);
    }

    // else {
    //     this.scrollToSectionView();
    // }
  }

  onWindowResize() {
    this.positionMoreIcon();
  }

  onSectionRendererChanges(evt: StateAction) {
    switch (evt.type) {
      case SECTION_EVENTS.SECTION_LOAD_SUCCESS:
      case SECTION_EVENTS.WIDGET_LOADED:
        const sectionToLoad = this.sections.find(s => s.loadEagerly && !s.isLoaded);
        this.srs.setSectionToRender(sectionToLoad as any);
        break;
    }
  }

  onMoreUpdate(evt, payload) {
    if (evt.type === 'MANAGE_CLICKED') {
      this.showManageSections = true;
      this.moreVisible = false;
      this.positionMoreIcon();
    } else if(evt.type === 'SECTION_CLICKED') {
      this.moreVisible = false;
      this.selectedTabIndex = evt.payload.navigateIndex
      this.positionMoreIcon();
    } else if(evt.type === 'MINI_REDIRECTION_CLICKED') {
      this.moreVisible = false;
    } else if(evt.type === "HIERARCHY_ICON_CLICKED") {
      this.moreVisible = false;
      const hierarchySection = this.sections.find(section => section.sectionId === evt.sectionId) as any;
      if(!hierarchySection.pinned) {
        this.sections.forEach((s: any) => {
          s.tempPinned = false;
        });
        hierarchySection.tempPinned = true;
      }
      this.selectedTabIndex = this.sections.indexOf(hierarchySection);
      this.router.navigate(['/' + hierarchySection.sectionId]);
      setTimeout(() => {
        this.positionMoreIcon();
      }, 0);
    }
  }

  manageSectionCancel() {
    this.showManageSections = false;
  }

  manageSectionOk() {
    const sections = [...this.manageSections.pinnedSections, ...this.manageSections.unPinnedSections];
    // if(sections.find(section => !section.tempPinned )){
    //   this.markFirstUnpinnedSection(sections);
    // }
    const sectionInfo = sections.map((section, index) => {
      return {
        sectionId: section.sectionId,
        order: index,
        pinned: section.pinned
      };
    });
    sections.forEach(sec => sec.tempPinned = false);
    const payload = { sectionInfo } as PinnedSection;
    this.isSaveInProgress = true;

    this.c360Service.upsertPinnedItems(payload).subscribe((response) => {
      this.isSaveInProgress = false;
      this.showManageSections = false;
      this.updateSections(sections);
      // this.toastMessageService.add(APPLICATION_MESSAGES.PINNED_ITEMS_UPDATED, MessageType.SUCCESS, null, { duration: 5000 });
        this.c360Service.createNotification("success", this.i18nService.translate('360.csm.APPLICATION_MESSAGES.PINNED_ITEMS_UPDATED'),5000);

      setTimeout(() => {
        this.attachScrollEventListener();
        this.positionMoreIcon();
      }, 500);
    });
  }

  manageReset() {
    const moduleConfig = this.env.moduleConfig;
    this.isSaveInProgress = true;
    this.visibilityStatus = {};
    const selectedSectionId = this.sections[this.selectedTabIndex].sectionId;
    this.c360Service.resetPinnedItems().subscribe((response) => {
      const { sections = [], layoutId } = response;
      const finalSections = this.isMini360 ? formMiniSectionsConfig(sections) : sections;
      this.showManageSections = false;
      this.isSaveInProgress = false;
      if(finalSections.length) {
        this.sections = finalSections.map(s => {
          s.layoutId = layoutId;
          return s;
        });
        if(this.isMini360){
          // this use case is only for mini360
          // Sort the sections since backend is not sorting the sections anymore and display order more than 5 can exist too which can be in the end of array too
          const supportedSections = finalSections.filter(section => section.displayOrder >= 0);
          const unsupportedSections = finalSections.filter(section => section.displayOrder < 0);
          const sortedSections = [...orderBy(supportedSections, ['displayOrder'], ['asc']), ...unsupportedSections];
          this.env.moduleConfig = { ...moduleConfig, finalSections: sortedSections, sections: sortedSections};
          this.sections = sortedSections;
          // this.getSections();
          this.sections.forEach(sec => sec.tempPinned = false);
          this.updateSections(this.sections)
          this.selectedTabIndex = this.sections.findIndex(section => section.sectionId === selectedSectionId);
          this.sections[this.selectedTabIndex].tempPinned = true;
        }
        else{
          //retain whatever was there for main
          this.env.moduleConfig = { ...moduleConfig, ...finalSections };
          // this.getSections();
          this.sections.forEach(sec => sec.tempPinned = false);
          this.updateSections(this.sections)
        }
          this.c360Service.createNotification('success', this.i18nService.translate('360.csm.APPLICATION_MESSAGES.PINNED_ITEMS_RESET'),5000);
        setTimeout(() => {
          this.attachScrollEventListener();
          this.positionMoreIcon();
        }, 500);
      } else {
          this.c360Service.createNotification('error', this.i18nService.translate('360.csm.APPLICATION_MESSAGES.PINNED_ITEMS_RESET_ERROR'),5000);
      }
    });
  }

  trackTabs(index: number, section: any) {
    return section.pinned;
  }

  updateSections(sections) {
    let selectedSectionId = cloneDeep(this.sections)[this.selectedTabIndex].sectionId;
    this.sections = sections;
    const moduleConfig = this.env.moduleConfig;
    if (this.isMini360) {
      // Create a map for quick lookup of the updated sections by sectionId
      const sectionsMap = new Map(sections.map(section => [section.sectionId, section]));
      const ogSections = cloneDeep(moduleConfig.sections);

      // Merge the existing sections with the updated sections and retain the order from `sections` array
      this.env.moduleConfig.sections = sections.map(updatedSection => {
        const existingSection = moduleConfig.sections.find(section => section.sectionId === updatedSection.sectionId);
        return existingSection ? { ...existingSection, ...updatedSection } : updatedSection;
      });

      // Include any remaining sections from moduleConfig.sections that are not in sections
      const remainingSections = ogSections.filter(section => !sectionsMap.has(section.sectionId));
      this.env.moduleConfig.sections.push(...remainingSections);

      // After rearranging, find the new index of the previously selected tab
      this.selectedTabIndex = this.env.moduleConfig.sections.findIndex(section => section.sectionId === selectedSectionId);
      if(!this.env.moduleConfig.sections[this.selectedTabIndex].pinned) {
        this.env.moduleConfig.sections[this.selectedTabIndex].tempPinned = true;
      }
    } else {
      // for main it will remain same since there is no concept of not available sections
      this.env.moduleConfig = {...moduleConfig, sections};
    }
    this.getSections();
  }

  onVisibilityChanged(section: any, status: IntersectionStatus) {
    window.requestAnimationFrame(() => {
      if (!this.visibilityStatus[section.sectionId] && status === 'Visible') {
        section.isLoaded = true;
        this.visibilityStatus[section.sectionId] = status;
      }
    });
  }

  onAction(evt: StateAction) {
    switch (evt.type) {
      case 'VERT_SCROLL_CHANGE':
        localStorage.setItem(`VERT_SCROLL_ENABLED_${this.ctx.pageContext}`, evt.payload ? 'true': 'false');
        // Reload main page from inside an iframe.
        this.forceReloadCurrentRoute();
        break;
      default: null
    }
  }

  reloadPage() {
    setTimeout(() => {
      try {
        window.top.location.reload();
      } catch (e) {
        window.location.reload();
      }
    });
  }

  forceReloadCurrentRoute() {
    const moduleConfig = this.env.moduleConfig;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    //let currentUrl = this.router.url;
    if(!this.isMini360){
      const sectionId: string = moduleConfig.sections[0].sectionId;
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([`/${sectionId}`]);
        this.router.routeReuseStrategy.shouldReuseRoute = () => true;
        this.router.onSameUrlNavigation = 'ignore';
      });
    }
  }

  attachScrollEventListener() {
    if(this.vertScrollElem) {
      const stream = fromEvent(this.vertScrollElem.nativeElement, "scroll");
      const controllerStream = stream.pipe(debounceTime(100));
      stream
        .pipe(
          throttle(() => controllerStream, {
            leading: false,
            trailing: true
          })
        )
        .subscribe((e) => {
          window.setTimeout(()=>this.getScrollYPositionAndHighlightTab(e));
        });
      this.scrollToSectionView();
    }
  }

  /**
   * Get scroll view info.
   */
  getScrollViewInfo() {
    try {
      if(this.isNativeWidget || this.ctx.isp || this.isMini360) {
        this.loadAll = false;
      } else {
        const value = localStorage.getItem(`VERT_SCROLL_ENABLED_${this.ctx.pageContext}`);
        if(JSON.parse(value) === true) {
          this.loadAll = true;
        } else {
          this.loadAll = false;
        }
      }
    } catch (e) {

    }
  }

  setScrollViewInfo(value: string) {
    try {
      localStorage.setItem(`VERT_SCROLL_ENABLED_${this.ctx.pageContext}`, value);
      if(JSON.parse(value) === true) {
        this.loadAll = true;
      } else {
        this.loadAll = false;
      }
    } catch (e) {

    }
  }

  scrollToSectionView() {
    if (this.loadAll) {
      window.requestAnimationFrame(() => {
        try {
            if(document.querySelector(".c360-section[data-sectionId='" + this.sectionId + "']")) {
                document.querySelector(".c360-section[data-sectionId='" + this.sectionId + "']").scrollIntoView();
            }
        } catch (e) {
          console.error(e)
         }
      });
    }
  }

  /**
   *
   * @param id cId or rId
   * @param pageContext C360 or R360
   */
  navigateToCR360({ id, pageContext}) {
    this.ctx.pageContext = pageContext;
    this.ctx.entityId = id;

    //Updating the ctx with generic constructs
    this.ctx.baseObject = 'company';
    this.ctx.entityType = 'company';
    this.ctx.uniqueIdentifierFieldName  = 'companyId';
    this.ctx.uniqueCtxId = 'cId'

    if(pageContext === PageContext.R360) {
      this.ctx.rId = id;

      //Updating the ctx with generic constructs
      this.ctx.baseObject = 'relationship';
      this.ctx.entityType = 'relationship';
      this.ctx.uniqueIdentifierFieldName  = 'relationshipId';
      this.ctx.uniqueCtxId = 'rId'
    }
    this.isSaveInProgress = true;
    this.c360Service.updateContextData().subscribe(() => {
      this.isSaveInProgress = false;
      this.moduleConfig = this.env.moduleConfig;
      // this.router.navigate().
      this.getSections(true);
    });
  }

  markFirstUnpinnedSection(sections) {
      const firstUnpinnedSection = sections.find(section => !section.pinned);

      firstUnpinnedSection ? firstUnpinnedSection.tempPinned = true : '';
  }

  onSectionChange(nzSelectedIndex) {
    if(this.sections[nzSelectedIndex]) {
      this.sectionChanged.emit(this.sections[nzSelectedIndex].sectionType);
    }
  }
}

@Pipe({
    name: 'addSectionPX',
    pure: false
})

export class PXSectionPipe implements PipeTransform {
    constructor( @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) {
    }
    transform(section) {
        return `${this.ctx.pageContext+"-"+ section.sectionType+"-section"}`;
    }
}
