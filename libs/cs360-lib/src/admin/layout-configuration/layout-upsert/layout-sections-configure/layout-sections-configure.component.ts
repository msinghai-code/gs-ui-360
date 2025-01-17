import { ActivatedRoute, NavigationExtras, NavigationEnd, Router } from '@angular/router';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { find, size, sortBy, filter } from 'lodash';
import { LayoutDetails, LayoutSection, LayoutSectionsConfigureMeta } from '../layout-upsert.interface';
import {LayoutUpsertService, SharedRouteOutletService} from '../layout-upsert.service';
import { SubSink } from 'subsink';
import { SectionCategory, SectionListOptions } from '../../../admin-sections/modules/shared/section-listing/section-listing.interface';
import { APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import { LayoutSectionScope, LAYOUT_UPSERT_MESSAGES } from '../layout-upsert.constants';
import { trigger, transition, style, animate } from '@angular/animations'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { PageContext } from '@gs/cs360-lib/src/common';
import { MessageType } from '@gs/gdk/core';
import {HybridHelper} from "@gs/gdk/utils/hybrid";
import { FormControl } from '@angular/forms';
import {TranslocoService} from "@ngneat/transloco";
import {NzI18nService} from "@gs/ng-horizon/i18n";
// import { PMTConnectionService } from "../../../shared/services/product_request/pmt-connection.service";
import { ConnectionInfoService } from '@gs/cs360-lib/src/common';
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import { CS360Service, Cs360ContextUtils } from '@gs/cs360-lib/src/common';
interface LayoutSectionWithEditableLabel extends LayoutSection {
  /**
   * @description Dont use it anywhere! Its for temporary use only while renaming (when we edit any label we assign this and when label edit is saved/cancelled, we delete it)
   * @deprecated
   */
  tempLabel?: string;

  /**
   * @description Used in prebuilt sections
   */
  originalLabel?: string;
  showAddAssociations?: boolean;
}

@Component({
  selector: 'gs-layout-sections-configure',
  templateUrl: './layout-sections-configure.component.html',
  styleUrls: ['./layout-sections-configure.component.scss'],
  animations: [
    trigger('items', [
      transition('void => added', [
        style({ background: '#ffffd0' }),
        animate('2.5s cubic-bezier(0,.86,.27,1)',
          style({ background: '#ffffd0' })
        ),
        animate('.8s ease-out',
          style({ background: '#fff' })
        ),
      ]),
    ]),
    trigger('fade', [
      transition('void => *', [
        style({ height: '0px'}),
        animate('.15s ease-in',
          style({ height: '*'})
        )
      ]),
      transition('* => void', [
        style({ height: '*'}),
        animate('.15s ease-out',
          style({ height: '0px'})
        )
      ])
    ]),
    trigger('fade2', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('.3s ease-out',
          style({ opacity: 1 }),
        )
      ])
    ])
  ]
})
export class LayoutSectionsConfigureComponent implements OnInit, AfterViewInit, OnDestroy {

  sectionCategories: SectionCategory[] = [];
  droppedSections: LayoutSectionWithEditableLabel[] = [];
  showConfirmSaveModal = false;
  showDetachModal = false;
  layoutDetails: LayoutDetails;
  sectionToNavigate: LayoutSection;
  loading = false;
  changed = false;
  // {360.admin.layout_sections_configure.sectionName}=Sections
  sectionListingOptions: SectionListOptions = {
    title: this.ctx.pageContext+' '+this.translocoService.translate('360.admin.layout_sections_configure.sectionName'),
    serverSideSearch: false
  };
  saveClicked = false;
  layoutScopes = LayoutSectionScope;
  isCreateMode: boolean;
  selectedSectionIndexToDetach;
  enableAnimation = false;
  associations: any[];
  label = this.ctx.pageContext;
  layoutId: string;
  typeId: string;
  addAssociationFormDrawer = {
    show: false,
    section: null,
    associationInfo: null,
    isBasicConfigEditable: false,
    onAddAssocAction: this.onAddAssocAction.bind(this)
  }
  protected subs = new SubSink();
  highlight = false;
  showSearchBar: boolean;
  searchInput = new FormControl();
  pmtConnectionData = false;
  showPreview: boolean = false;
  isPartner: boolean = false;
  params: any = {};
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    if(this.getIsChanged()) {
      event.returnValue = false;
    }
  }

  constructor(protected layoutUpsertService: LayoutUpsertService,
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
    private route: ActivatedRoute,
    private c360Service: CS360Service,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sharedRouteOutletService: SharedRouteOutletService,
    private translocoService: TranslocoService,
    private i18nService : NzI18nService,
    private connectionInfoService: ConnectionInfoService) { }

  ngOnInit() {
    this.addRouteDataSubscription();
    if(this.ctx.pageContext === PageContext.R360) {
      this.addAssociationsSubscription();
    }
    const queryParams = this.route.snapshot.queryParams;
    if(queryParams.managedAs  &&  queryParams.managedAs === "partner") {
      this.isPartner = true;
    }
    this.layoutId = this.layoutDetails.layoutId;
    // this.relTypeId = this.ctx.relationshipTypeId ? this.ctx.relationshipTypeId : " " ;
    this.typeId = this.ctx[this.ctx.contextTypeId] ? this.ctx[this.ctx.contextTypeId] : " " ;
      this.translocoService.selectTranslateObject('360.admin.standard_layout')
          .pipe()
          .subscribe(result => {
              this.sectionListingOptions= {
                  title: this.ctx.pageContext+' '+this.translocoService.translate('360.admin.layout_sections_configure.sectionName'),
                  serverSideSearch: false
              };
          });
    // this.params.entity = Cs360ContextUtils.getTranslatedBaseObjectNameV2(Cs360ContextUtils.getContextToEntityNameMapping(this.ctx.pageContext));
    this.params.entity = this.ctx.standardLayoutConfig.labelForTranslation;
  }

  getConnectionInfoService(event) {
    this.connectionInfoService
        .getConnectionInfoStatus().pipe(catchError(err=> {
      this.pmtConnectionData = false;
      return throwError(err)
      })).subscribe(({data}) => {
        if (data.integrationType === "AUTONOMOUS" || ((data.integrationType === "PRODUCTBOARD" || data.integrationType === "AHA") && data.rmtConnectionDetails.id)) {
          this.addSection(event);
        } else {
          this.c360Service.createNotification('error', this.i18nService.translate('360.admin.layout_sections_configure.product_error_message'),8000);
        }
      });
  }

  clearSearch(){
    this.showSearchBar = false;
    // this.droppedSections=this.searchResult;
    this.searchInput.patchValue('');
  }

  saveInput(section: LayoutSectionWithEditableLabel) {
    section.tempLabel !== section.label ? this.changed = true : '';
    section.label = section.tempLabel || section.sectionName || section.label;
    this.resetInput(section);
  }

  resetInput(section) {
    section.showLabelInput = false;
    delete section.tempLabel;
  }

  protected addAssociationsSubscription() {
    this.layoutUpsertService.fetchAssociations().subscribe(data => {
      // this.associations = filter(data, assoc => assoc.relationshipTypeIds.includes(this.ctx.relationshipTypeId) || assoc.relationshipTypeIds.includes("ALL_CURRENT_AND_FUTURE_TYPES")) || [];
      this.associations = filter(data, assoc => assoc.relationshipTypeIds.includes(this.ctx[this.ctx.standardLayoutConfig.groupByType.typeId]) || assoc.relationshipTypeIds.includes("ALL_CURRENT_AND_FUTURE_TYPES")) || [];
    })
  }

  protected addRouteDataSubscription() {
    this.subs.add(this.route.data.subscribe(response => {
      const data: LayoutSectionsConfigureMeta = response.meta;
      const { sectionCategories, layoutDetails } = data;
      this.sectionCategories = sectionCategories as any;
      this.layoutDetails = layoutDetails;
      this.isCreateMode = this.route.snapshot.queryParams.mode === "create";
      this.sharedRouteOutletService.emitChange(this.layoutDetails.name || this.i18nService.translate('360.admin.layout_upsert.newLayout'));
    }));
  }

  protected destroyCacheAndNavigate(route?: string, extras?: NavigationExtras, isCancel?: boolean) {
    this.layoutUpsertService.destroyCache();
    if (route) {
      this.loading = true;
      this.router.navigate([route], extras || {});
    }
    if(isCancel) {
        this.loading = false;
    }
  }

  protected getAssociationError(section: LayoutSectionWithEditableLabel) {
    if(section.scope === LayoutSectionScope.GLOBAL && section.associatedObjects && !section.associatedObjects.every(val => (this.associations.map( ass => ass.objectName)).includes(val))) {
      return true;
    }
  }

  protected addItem(section: LayoutSectionWithEditableLabel, index?: number) {
    const categorySection = this.getLocalCategorySection(section);
    let label = section.label;
    categorySection.configurable = section.scope === LayoutSectionScope.GLOBAL ? false : categorySection.configurable;
    const modifiedSection = { ...section,
      // showAddAssociations: this.ctx.pageContext === PageContext.R360 ? this.getAssociationError(section) : false,
      showAddAssociations: this.ctx.contextTypeId ? this.getAssociationError(section) : false,
      configurable: categorySection.configurable,
      sectionName: categorySection.label,
      multiplesAllowed: categorySection.multiplesAllowed
    };
    this.setGlobalSectionLabel(modifiedSection);
    if(index === void 0) {
      this.droppedSections.push({ ...modifiedSection });
    } else {
      this.droppedSections.splice(index, 0, { ...modifiedSection });
    }
    this.droppedSections = [...this.droppedSections];
  }

  protected setGlobalSectionLabel(section: LayoutSectionWithEditableLabel) {
    if(section.scope === LayoutSectionScope.GLOBAL && !section.decoupled) {
      const category = this.sectionCategories.find(cat => cat.id === LayoutSectionScope.GLOBAL);
      const sectionFound = find(category.children, sect => sect.sectionId === section.sectionId);
      section.originalLabel = sectionFound ? sectionFound.label : section.sectionLabel;
    }
  }

  protected getLocalCategorySection(section: LayoutSection): LayoutSection {
    const category = this.sectionCategories.find(cat => cat.id === LayoutSectionScope.LOCAL);
    const sectionFound = find(category.children, sect => sect.sectionType === section.sectionType);
    return {...sectionFound} || <LayoutSection>{};
  }

  //360.admin.layout_configure.reqAssociation = Add required associations to save.
  protected saveAndNavigate(isDraftClick?: boolean) {
    if(this.droppedSections.findIndex(sec => sec.showAddAssociations) !== -1) {
      this.c360Service.createNotification('error', this.i18nService.translate('360.admin.layout_configure.reqAssociation'), 5000);
      return;
    }
    this.loading = true;
    this.layoutDetails.sections = sortBy(this.droppedSections, section => section.y).map((section, idx) => {
      const sectionProperties = section;
      sectionProperties.displayOrder = idx + 1;
      delete sectionProperties.createdDate;
      if(!sectionProperties.label) {
        sectionProperties.label = sectionProperties.originalLabel;
      }
      delete sectionProperties.originalLabel;
      delete sectionProperties.createdBy;
      delete sectionProperties.deleted;
      delete sectionProperties.usageCount;
      delete sectionProperties.modifiedBy;
      delete sectionProperties.modifiedDate;
      return sectionProperties;
    });
    if(this.isPartner) {
      this.layoutDetails.managedAs = "PARTNER"
    }
    this.subs.add(this.layoutUpsertService.updateLayout(this.layoutDetails).subscribe((response) => {
      this.changed = false;
      this.loading = false;
      this.saveClicked = true;
      const data = response.data;
      if (this.sectionToNavigate) {
        const selectedSection = data.sections.find(sect => {
          if(this.sectionToNavigate.scope === LayoutSectionScope.LOCAL || this.sectionToNavigate.decoupled) {
            return sect.label === this.sectionToNavigate.label && sect.displayOrder === this.sectionToNavigate.displayOrder;
          } else {
            return sect.sectionId === this.sectionToNavigate.sectionId;
          }
        });
        this.destroyCacheAndNavigate(APPLICATION_ROUTES.SECTION_CONFIGURE(this.layoutDetails.layoutId, selectedSection.sectionId), { queryParamsHandling: 'preserve' });
      } else if (this.isCreateMode) {
        if(isDraftClick) {
          let routerPath: string = this.isPartner ? APPLICATION_ROUTES.PARTNER_LAYOUTS : APPLICATION_ROUTES.STANDARD_LAYOUTS;
          this.destroyCacheAndNavigate(routerPath);
        } else {
          this.destroyCacheAndNavigate(APPLICATION_ROUTES.LAYOUT_ASSIGN(this.layoutDetails.layoutId), { queryParamsHandling: 'preserve' });
        }
      } else if (!response.success) {
        this.c360Service.createNotification('error', response.error.message, 5000);
        return;
      } else {
        this.c360Service.createNotification('success',this.i18nService.translate('360.admin.LAYOUT_UPSERT_MESSAGES.LAYOUT_UPDATE_SUCCESS'), 5000);
        this.droppedSections.forEach(sect => {
          const responseSection = data.sections.find(s => s.sectionType === sect.sectionType && s.displayOrder === sect.displayOrder);
          sect.sectionId = responseSection.sectionId;
          this.setGlobalSectionLabel(responseSection);
          sect.scope = responseSection.scope;
        })
        this.destroyCacheAndNavigate();
      }
    }))
  }

  ngAfterViewInit() {
    this.renderSections();
  }

  protected renderSections() {
    if (size(this.layoutDetails.sections)) {
      sortBy(this.layoutDetails.sections, section => section.displayOrder).forEach(widgetItem => this.addItem(widgetItem));
      this.cdr.detectChanges();
    }
  }

  getIsChanged() {
    return this.changed && !this.saveClicked;
  }

  handleSectionLabel(section: LayoutSectionWithEditableLabel) {
    if(!section.showLabelInput) {
      section.tempLabel = section.label || section.originalLabel;
      section.showLabelInput = true;
    }
  }

  onAddAssociationsClick(section: LayoutSectionWithEditableLabel) {
    this.addAssociationFormDrawer = {
      ...this.addAssociationFormDrawer,
      show: true,
      section,
      associationInfo: {
        relationshipTypeIds: [this.ctx.relationshipTypeId],
        objectNames: section.associatedObjects.filter(obj => !this.associations.map( ass => ass.objectName).includes(obj))
      }
    }
  }

  onSectionDrop(event: CdkDragDrop<any>) {
    this.highlight = false;

    // When section dropped from foriegn list
    if(event.container !== event.previousContainer) {

      if (!this.ctx.contextTypeId && event.item.data && event.item.data.sectionType === "PRODUCT_REQUESTS") {
         this.getConnectionInfoService(event);
         return;
      }
      this.addSection(event);
    }
    // On section rearrange
    else if(event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.droppedSections, event.previousIndex, event.currentIndex);
      this.changed = true;
    }

    this.enableAnimation = true;
    setTimeout(() => {
      this.enableAnimation = false;
    }, 2500);
  }

  addSection(event) {
    delete event.item.data.disableDrag;
    delete event.item.data.dimensionDetails;
    const section = {...event.item.data} as LayoutSectionWithEditableLabel;
    if(section.scope === this.layoutScopes.GLOBAL) {
      section.originalLabel = section.label || section.sectionType;
      delete section.label;
    } else {
      section.label = section.label || section.sectionType;
    }
    this.addItem({ ...section, configured: section.configured || !section.configurable }, event.currentIndex);
    this.changed = true;
  }

  checkForHighlight(event) {
    this.highlight = !!(event.item && event.item.data);
  }

  onSectionConfigureClick(section: LayoutSection) {
    if (this.changed) {
      this.showConfirmSaveModal = true;
      this.sectionToNavigate = section;
      return;
    }
    this.destroyCacheAndNavigate(APPLICATION_ROUTES.SECTION_CONFIGURE(this.layoutDetails.layoutId, section.sectionId), { queryParamsHandling: 'preserve' });
  }

  onSectionDelete(section: any) {
    this.changed = true;
    this.droppedSections.splice(this.droppedSections.indexOf(section), 1);
    this.droppedSections = [...this.droppedSections];
  }

  onConfirmSaveModalOkClick() {
    this.saveAndNavigate();
  }

  onDetachSection(section) {
    this.selectedSectionIndexToDetach = this.droppedSections.indexOf(section);
    this.showDetachModal = true;
  }

  onDetachModalOkClick() {
    const selectedSectionToDetach = this.droppedSections[this.selectedSectionIndexToDetach];
    const newSection = {...selectedSectionToDetach, scope: LayoutSectionScope.LOCAL};
    const categorySection = this.getLocalCategorySection(newSection);
    delete selectedSectionToDetach.description;
    const sectionToAdd = {
      ...selectedSectionToDetach,
      label: selectedSectionToDetach.label || selectedSectionToDetach.originalLabel,
      decoupled: true,
      configured: true,
      configurable: categorySection.configurable,
      sectionName: categorySection.label,
      multiplesAllowed: categorySection.multiplesAllowed
    };
    delete sectionToAdd.originalLabel;
    this.droppedSections[this.selectedSectionIndexToDetach] = {...sectionToAdd};
    this.droppedSections = [...this.droppedSections];
    this.selectedSectionIndexToDetach = null;
    this.showDetachModal = false;
    this.changed = true;
  }

  onCancelClick() {
    let routerPath: string = this.isPartner ? APPLICATION_ROUTES.PARTNER_LAYOUTS : APPLICATION_ROUTES.STANDARD_LAYOUTS;
    this.destroyCacheAndNavigate(routerPath, {},true);
  }

  clickedSearchIcon(event: Event) {
    this.showSearchBar = true;
  }

  onSaveAsDraftClick() {
    this.saveAndNavigate(true);
  }

  onSaveClick() {
    this.saveAndNavigate();
  }

  onBackClick() {
    this.destroyCacheAndNavigate(APPLICATION_ROUTES.LAYOUT_DETAILS(this.layoutDetails.layoutId), { queryParamsHandling: 'preserve' });
  }

  onAddAssocAction(isSave: boolean) {
    if(isSave) {
      this.addAssociationFormDrawer.section.showAddAssociations = false;
    }
    this.addAssociationFormDrawer = {
      ...this.addAssociationFormDrawer,
      show: false,
      section: null
    }
  }

  openPreviewconfig(layoutId: string) {
    if(sessionStorage) {
      try {
        //saving this page url to sessionStorage to use when user tries to come back from preview page
        if(this.isPartner) {
          this.ctx.previewConfig.previewTypeId ? sessionStorage.setItem('previewCallBackURL', `${this.ctx.pageContext.toLowerCase()}#/layout/${layoutId}/configure?typeId=${this.typeId}&managedAs=partner`) : sessionStorage.setItem('previewCallBackURL', `${this.ctx.pageContext.toLowerCase()}#/layout/${layoutId}/configure?managedAs=partner`);
        } else {
          this.ctx.previewConfig.previewTypeId ? sessionStorage.setItem('previewCallBackURL', `${this.ctx.pageContext.toLowerCase()}#/layout/${layoutId}/configure?typeId=${this.typeId}`) : sessionStorage.setItem('previewCallBackURL', `${this.ctx.pageContext.toLowerCase()}#/layout/${layoutId}/configure`);
        }
      } catch (e) {
        throw new Error('Sessionstorage is not supported.');
      }
    }
    this.params = {
      ...this.params,
      layoutId,
      relTypeId: this.typeId
    }
    this.showPreview = true;

  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
