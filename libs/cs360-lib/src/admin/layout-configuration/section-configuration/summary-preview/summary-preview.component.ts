import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Subject } from 'rxjs';
import { SubSink } from 'subsink';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { SectionConfigurationService } from "../section-configuration.service";
import { SectionStateService } from '@gs/cs360-lib/src/common';
import { NzIconService } from '@gs/ng-horizon/icon';
import { getCdnPath } from "@gs/gdk/utils/cdn";

const PRECONFIGURED_SECTION = 'PRECONFIGURED_SECTION';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { CsmSummaryComponent } from '@gs/cs360-lib/src/csm';
import { PageContext } from '@gs/cs360-lib/src/common';

@Component({
    selector: 'gs-summary-preview',
    templateUrl: './summary-preview.component.html',
    styleUrls: ['./summary-preview.component.scss']
})
export class SummaryPreviewComponent implements OnInit {

    @ViewChild(CsmSummaryComponent, {static: false}) csmSummary: CsmSummaryComponent;
    @Input() section;
    @Input() sectionName: string;

    @Output() actions = new EventEmitter();

    selectedCompany: string;
    selectedCompanyObj;
    isPreviewItemsLoading: boolean = false;
    txtQueryChanged: Subject<string> = new Subject<string>();
    previewItems: any[] = [];
    isSelectedItemLoading: boolean = false;
    wrapperStyles = {
        padding: '0px',
        height: 'calc(100% - 7.2rem)',
        backgroundColor: 'rgba(246, 248, 250, 0.5)',
        display: 'flex',
        "flex-direction": 'column'
    };
    state;
    stateLoading = false;
    previewCtx: any;
    previewModes = {
        mobileScreen : 'mobileScreen',
        smallScreen : 'smallScreen',
        largeScreen : 'largeScreen'
    };
    
    previewModeDimensions = {
        [this.previewModes.mobileScreen]:{
            width : 1200
        },
        [this.previewModes.smallScreen]:{
            width : 1440
        },
        [this.previewModes.largeScreen]:{
            width : 1920,
        }
    };
    modeDimension;
    previewModesList = Object.keys(this.previewModes).map(key => this.previewModes[key]);
    selectedPreviewMode;
    radioValue = 'smallScreen';

    private subs = new SubSink();

    constructor(
        public sectionConfigurationService: SectionConfigurationService,
        private stateService: SectionStateService,
        private cdr: ChangeDetectorRef,
        private iconService: NzIconService,
        @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO
        ) {

    }

    ngOnInit() {
        this.section.entityType = this.ctx.baseObject;
        this.subscribeForSearch();
        this.loadState();
        this.changePreviewMode(this.previewModes.smallScreen);
        this.prepareIconService();
    }

    searchItemsForPreview(searchedValue: string) {
        this.txtQueryChanged.next(searchedValue);
    }

    onItemDropdownOpen($event) {
        if ($event && !this.selectedCompany) {
            // this.checkForUnsavedChanges();
        }
    }

    protected async prepareIconService() {
        // if(this.ctx.pageContext === PageContext.C360){
        //     var cdnPath = await getCdnPath("cs360-admin");
        // } else {
        //     var cdnPath = await getCdnPath("r360-admin");
        // }
        var cdnPath = await getCdnPath(this.ctx.cdnPath);
        // const baseUrl = 'https://localhost:4200'; /// for local testing 
        this.iconService.changeAssetsSource(cdnPath);
    }

    subscribeForSearch() {
        this.subs.add(this.txtQueryChanged.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((value: string) => {
            this.loadDataForPreview({ searchedValue: value, isDefault: !value});
        }));
    }

    onValueSelectedItemChange($event) {
        this.isSelectedItemLoading = true;
        setTimeout(() => {
            this.isSelectedItemLoading = false;
            this.selectedCompany = $event;
            this.section.selectedCompanyId = $event;
            this.section.isPreview = true;
            // if(this.ctx.pageContext === 'C360') {
            //     this.previewCtx = {...this.ctx, cId: this.selectedCompany}
            // } else {
            //     this.previewCtx = {...this.ctx, rId: this.selectedCompany}
            // }
            this.previewCtx = {...this.ctx, [this.ctx.previewConfig.previewKey]: this.selectedCompany, entityId: this.selectedCompany}
            this.selectedCompanyObj = this.previewItems.find(item => item.Gsid === this.selectedCompany);
        }, 0);        
    }

    loadDataForPreview({searchedValue = '', gsid = '', isDefault = false, callback}: any): void {
        if (this.section.sectionType === 'SUMMARY') {
            this.isPreviewItemsLoading = true;
            const objectName = this.ctx.baseObject;
            const payload = Cs360ContextUtils.getPreviewDataPayload(searchedValue, gsid);
            payload.objectName = objectName;
            this.subs.add(this.sectionConfigurationService.fetchPreviewRecords(payload, isDefault).subscribe((data) => {
                if (data) {
                    this.previewItems = [...data.records];
                }
                this.isPreviewItemsLoading = false;

                this.cdr.detectChanges();
                callback && callback();
            }));
        }
    }

    changePreviewMode(mode) {
        this.selectedPreviewMode = mode;
        this.modeDimension = this.previewModeDimensions[mode];
        const zoomValue = window.innerWidth/this.modeDimension.width;
        this.modeDimension = {
            width : this.modeDimension.width + "px"
        }
        if(this.selectedPreviewMode !== this.previewModes.largeScreen) {
            this.modeDimension = {...this.modeDimension , "align-self": "center"};
        }
        if(zoomValue < 1 || mode === 'largeScreen'){
            this.modeDimension = {...this.modeDimension , zoom : zoomValue};
        }
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 0);
    }

    loadState() {
        this.stateLoading = true;
        this.stateService.getAdminPreviewState(this.section.layoutId || PRECONFIGURED_SECTION, this.section.sectionId).subscribe(res => {
            console.log(res);
            if(res && res.state) {
                this.section.selectedCompanyId = res.state.selectedCompany;
                this.section.isPreview = true;
                this.selectedCompany = res.state.selectedCompany;
                this.state = res.state;
            }
            // if(this.ctx.pageContext === 'C360') {
            //     this.previewCtx = {...this.ctx, cId: this.selectedCompany}
            // } else {
            //     this.previewCtx = {...this.ctx, rId: this.selectedCompany}
            // }
            this.previewCtx = {...this.ctx, [this.ctx.previewConfig.previewKey]: this.selectedCompany, entityId: this.selectedCompany}
            
            if(!this.selectedCompany) {
                this.loadDataForPreview({ isDefault: true });
            } else {
                this.loadDataForPreview({
                    gsid: this.selectedCompany,
                    callback: () => {
                        this.loadDataForPreview({ searchedValue: '', isDefault: true })
                    }
                });
            }

            this.stateLoading = false;
        })
    }

    close() {
        this.actions.emit({ type: 'CLOSE' })
    }

    ngOnDestroy() {
        this.subs.unsubscribe();

        if(!this.state || (this.selectedCompany && this.selectedCompany !== this.state.selectedCompany)) {
            this.stateService.saveState({
                referenceId: `${this.section.layoutId || PRECONFIGURED_SECTION}_${this.section.sectionId}`,
                state: {
                    selectedCompany: this.selectedCompany,
                },
                moduleName: this.ctx.pageContext + "_admin"
            }).subscribe();
        }
    }
}
