import {Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation} from "@angular/core";
import {CONTEXT_INFO, CS360Service, ICONTEXT_INFO, isMini360, PageContext} from "@gs/cs360-lib/src/common";
import {merge} from "lodash";
import { NzIconService } from "@gs/ng-horizon/icon";
import { EnvironmentService } from "@gs/gdk/services/environment";
import { forkJoin, Observable, of } from "rxjs";
import { HttpProxyService } from "@gs/gdk/services/http";
import { map } from "rxjs/operators";

@Component({
  templateUrl: './widget-wrapper.component.html',
  styleUrls: ['./widget-wrapper.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class WidgetWrapperComponent implements OnInit, OnChanges {
  title = 'cs360-widget';
  render = false;
  sectionType;
  loading = true;

  constructor(
    private cs360Service: CS360Service,
    @Inject("envService") private env: EnvironmentService,
    @Inject(CONTEXT_INFO) public appCtx: ICONTEXT_INFO,
    private iconService: NzIconService,
    private http: HttpProxyService
  ) {
  }

  @Input() context: ICONTEXT_INFO;

  @Output() modalInstanceClose = new EventEmitter<boolean>();


  /**
   * If the environment where this widget is being used is not having or having incomplete GS object,
   * they can pass this flag as true and we will make an API call (to nodejs) to load GS object
   */
  @Input() loadgsobject: Boolean;
  @Input() hideheader: Boolean;
  @Input() retainSectionTypeOnContextChange = true;
  @Input() resizable = true;

  ngOnInit() {

  }

  /**
   * When this web component is integrated in non-angular environment,
   * the inputs are passed as attributes. So they will be in string format
   * @param prop Input properties of this component
   */
  parseStringInput(prop) {
    if(typeof this[prop] === 'string') {
      try {
        this[prop] = JSON.parse(this[prop]);
      } catch(e) {
        console.error(`${prop} input is not a valid JSON (or boolean)`);
      }
    }
  }

  onFinalModalClose(evt:boolean){
    this.modalInstanceClose.emit(evt)
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Inputs >>> ', changes);

    // CTX in cs360 app is provided in main.ts by reading from queryParams. In this web component, we depend on the consumer to send this context.
    if(!this.context) {
      return;
    }

    this.parseStringInput('hideheader');
    this.parseStringInput('resizable');
    this.parseStringInput('loadgsobject');
    this.parseStringInput('context');

    if(changes.context) {

      this.loading = true;
      // Platform changes- context to be injected here to make the below values available.
      // Another place to add the below variable is in gs-ui-zoom code base.
      const additionalContext  = this.context.pageContext ===  PageContext.C360 ? {
        entityType: 'company',
        baseObject : 'company',
        uniqueIdentifierFieldName : 'companyId',
        errorType : 'COMPANY_NOT_FOUND',
        uniqueCtxId : 'cId',
        layoutResolveType: 'cid',
        typeId : null,
        sharingType: 'internal',
        layoutResolvePrependUrl: '',
        sectionPrependUrl: ''
      } :
      {
        entityType: 'relationship',
        baseObject : 'relationship',
        uniqueIdentifierFieldName : 'relationshipId',
        errorType : 'RELATIONSHIP_NOT_FOUND',
        uniqueCtxId : 'rId',
        layoutResolveType: 'cid',
        typeId : 'relationshipTypeId',
        sharingType: 'internal',
        layoutResolvePrependUrl: '',
        sectionPrependUrl: ''
      }
      if(isMini360(this.context)) { // Last opened companies opens up on clicking other companyId(different DataSource). Clearing it for mini360
        Object.keys(this.appCtx).forEach(key => delete this.appCtx[key]);
      }
      merge(this.appCtx, {
        ...this.context,
        entityId: this.context.pageContext === PageContext.C360 ? this.context.cId : this.context.rId,
        containerResizable: this.resizable,
        ...additionalContext
      });

      this.render = false;
      forkJoin([this.cs360Service.updateContextData(this.context), this.getGsObject()]).subscribe(([contextData, gsObject]) => {
        this.render = !!contextData;

        if(gsObject) {
          merge(window.GS, gsObject);
        }

        this.env.moduleConfig = {...this.env.moduleConfig,...window.GS.userConfig.user, ...window.GS.userConfig.host, ...window.GS.userConfig.instance, ...window.GS.userConfig};
      });
    }
  }

  getGsObject(): Observable<any> {
    if(!this.loadgsobject) {
      return of({});
    }

    return this.http.get('v1/ui/cs/bootstrap').pipe(map(res => res.result && res.data));
  }

  // actually onSectionLoad this event will be emitted when the landing page loads sections (API call)
  onSectionChanged(sectionType) {
    this.sectionType = sectionType;
    this.loading = false;
  }
}
