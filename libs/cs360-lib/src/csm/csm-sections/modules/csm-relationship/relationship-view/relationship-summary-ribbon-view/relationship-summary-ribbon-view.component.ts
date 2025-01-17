import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {isEmpty, cloneDeep} from "lodash";
import { API_ENDPOINTS, GALAXY_ROUTE, PageContext } from '@gs/cs360-lib/src/common';
// import { ReportFilterUtils} from "@gs/report/utils";
import { ReportFilter } from "@gs/report/pojos";
import { ReportFilterUtilsCore} from "@gs/cs360-lib/src/core-references";
import {RelationshipSummaryRibbonViewService} from "./relationship-summary-ribbon-view.service";
import {getCompanyFilterCondition} from "../../csm-relationship.utils";
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';

@Component({
  selector: 'gs-relationship-summary-ribbon-view',
  templateUrl: './relationship-summary-ribbon-view.component.html',
  styleUrls: ['./relationship-summary-ribbon-view.component.scss']
})
export class RelationshipSummaryRibbonViewComponent implements OnInit, AfterViewInit {

  @Input() configs: any;
  @Input() options: { maxLimit: number } = { maxLimit: 6 };
  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

  public attributesConfig: any = [];
  private ribbonData: any[];
  public isMini360: boolean = false;
  showLeftArrow: boolean = false;
  showRightArrow: boolean = false;
  observer: IntersectionObserver;

  constructor(private relationshipSummaryRibbonViewService: RelationshipSummaryRibbonViewService,
              @Inject("envService") private _env: EnvironmentService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) { }

  async ngOnInit() {
    this.isMini360 = isMini360(this.ctx);
    this.ribbonData = await this.relationshipSummaryRibbonViewService.fetchSummaryRibbonBootstrapData();
    this.attributesConfig = this.configs.attributes
                                .map(attribute => {
                                  return {
                                    item: {...attribute, displayName: attribute.label},
                                    config: this.getSummaryAttributeData(attribute)
                                  }
                                });
  }

  ngAfterViewInit() {
    if(this.isMini360){
      setTimeout(() => {
        this.observeViewScroll();
      }, 1000);
    }
  }

  private apiEndPointMapperFromRegistry(attribute: any) {
    const matchedAttribute: any = this.ribbonData.find(r => r.attributeId === attribute.attributeId);
    if(!isEmpty(matchedAttribute)) {
      if(['Summary_OVERDUE_CTAS', 'Summary_CTAS_DUE_THIS_WEEK', 'Summary_OPEN_CTAS'].includes(attribute.attributeId)) {
        const { type } = this.configs;
        const qpObject = {
          // et: this.ctx.pageContext === PageContext.C360 ? 'COMPANY' : 'RELATIONSHIP',
          et: this.ctx.baseObject.toUpperCase(),
          etId: type && type.id !== 'ALL' ? type.id: null,
          id: this.ctx.cId
        }
        return API_ENDPOINTS.GET_CTA(qpObject);
      }
      return matchedAttribute.dataFetchEndpoint.path;
    } else {
      return `${GALAXY_ROUTE}/cr360/data/relationship/ribbon`;
    }
  }

  // url, payload and filters
  private getSummaryAttributeData(attribute: any): any {
    return {
      url: this.apiEndPointMapperFromRegistry(attribute),
      payload: this.formPayload(attribute)
    }
  }

  private formPayload(attribute: any): any {
    const { attributeId, config } = attribute;
    // Add company filter to existing filters.
    //Copied addFilters from core and added to core-references. Changed name of util to avoid confusion.
    //Tried using the same form @gs/report but the implementation is different
    const filters = ReportFilterUtilsCore.addFilters(cloneDeep(this.configs.whereClause), [getCompanyFilterCondition(this.ctx.cId)]);
    if(!!attributeId) {
      return {
        ids: [attributeId], filters
      }
    }
    return {
      config: [config], filters
    };
  }

  public refresh(filters: ReportFilter) {
    this.configs.whereClause = filters;
    this.ngOnInit();
  }

  private observeViewScroll() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === this.scrollContainer.nativeElement.children[0]) {
          this.showLeftArrow = !entry.isIntersecting;
        } else if (entry.target === this.scrollContainer.nativeElement.lastChild) {
          this.showRightArrow = !entry.isIntersecting;
        }
      });
    }, {
      root: this.scrollContainer.nativeElement,
      threshold: 1.0
    });

    // Observe the first and last children of the scroll container
    const scrollChildren = this.scrollContainer.nativeElement.children;
    if (scrollChildren.length > 0) {
      this.observer.observe(scrollChildren[0]);
      this.observer.observe(scrollChildren[scrollChildren.length - 1]);
    }
  }

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({ left: -250, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({ left: 250, behavior: 'smooth' });
  }
}
