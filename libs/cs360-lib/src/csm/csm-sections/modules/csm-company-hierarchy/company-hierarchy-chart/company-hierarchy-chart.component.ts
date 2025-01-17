import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnInit, Renderer2, SimpleChange, SimpleChanges } from '@angular/core';
import { map } from 'lodash';
import { CHART_ATTRIBUTES as ca } from './map/map.constant';
import { addEllipsis } from './map/map.utils';
import {CONTEXT_INFO, DataTypes, ICONTEXT_INFO, isMini360} from '@gs/cs360-lib/src/common';
import { MapComponent } from './map/map.component';
import { IMapData, IMapOptions } from './map/pojos/IMap';
import { MapService } from './map/map.service';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { CsmCompanyHierarchyService } from '../csm-company-hierarchy.service';
import { escape } from "lodash";

@Component({
  selector: 'gs-company-hierarchy-chart',
  templateUrl: './company-hierarchy-chart.component.html',
  styleUrls: ['./company-hierarchy-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyHierarchyChartComponent extends MapComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() data:IMapData | any;
  @Input() renderParams:IMapOptions;
  @Input() config: any;
  @Input() showHierarchyWarning: boolean;

  isFullScreenMode = false;
  isMini360 = false;
  public ALLOWED_HTML_TAG_FOR_STRING_DTS = ['a', 'b'];

  constructor(protected mapService:MapService,
              @Inject("envService") protected env: EnvironmentService,
  protected renderer:Renderer2,
  protected elementRef:ElementRef,
  protected cdr:ChangeDetectorRef,
  private hierarchyService: CsmCompanyHierarchyService,
  @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,) {
    super(mapService,env,renderer,elementRef,cdr);
  }

  ngOnInit() {
      this.isMini360 = isMini360(this.ctx);
  }

  ngOnChanges(changes: SimpleChanges) {
    if( changes.data && !changes.data.firstChange) {
      super.initialise();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initialise();
    })
  }

  protected setChartAttributes() {
    super.setChartAttributes();
    this.nodeFieldsArray = [...['name','childCount'],...map(this.config, "fieldAlias")];
    this.calcChartAttributes = {
      ...this.calcChartAttributes,
      imageCircleRadius: 0,
      nameHeight: 20,
      nodeHeight: 200,
      nodeWidth: 220,
      countWidth:54, countHeight:25,
      countFontSize: 16,
      textPaddingX : ca.nodePadding + 8,
      paddingY:ca.nodePadding + ca.nameHeight,
    }
  }

  protected getNodeBinding() {
    return {
      ...this.getNameNodeBinding(),
      ...this.getNamedMapCountNodeBinding(),
      ...this.getAdditionalNodeBinding()
    }
  }

  protected getEventListeners(){
    return [
      ...super.getEventListeners(),
      {selector : '.js-named-map-count', eventName:this.getEventForUserAgent(), callback: this.expandCollapse},
    ];
  }

  private expandCollapse(e){
		if(e){
      e.stopPropagation();
    }
		const fieldId = e.target && e.target.parentNode;
		const id = fieldId.parentNode.getAttribute('node-id');
		this.targetNode = id;
		const nodeMapObj = this.mapService.getBGNode(this.map, this.targetNode.id);
		// If already child nodes are fetched just perform expand/collapse action
		if(nodeMapObj.childrenIds.length){
			if (nodeMapObj.collapsedChildrenIds.length){
        this.mapService.expand(this.map, nodeMapObj);
			}else{
        this.mapService.collapse(this.map, nodeMapObj);
			}
		}
  }

  private getEventForUserAgent(){
    const userAgent = navigator.userAgent;
    return userAgent.includes('iPad') || userAgent.includes('iPhone') || userAgent.includes('Android')? "touchend": "click";
  }

	toggleFullScreen() {
		this.isFullScreenMode = !this.isFullScreenMode;
    setTimeout(()=> {
      const currentScale = this.mapService.getScale(this.map);
      if(currentScale > ca.scaleMax){
        this.mapService.zoom(this.map,0.99/currentScale);
      }else if(currentScale < ca.scaleMin){
        this.mapService.zoom(this.map,true);
      }
      if(this.isFullScreenMode) {
        this.map.fit();
      } else {
        this.mapService.zoom(this.map, 2);
        this.map.center(this.renderParams.primaryNode, {
          rippleId: 1,
          vertical: true,
          horizontal: false
        });
      }
    })
	}

  private getNamedMapCountNodeBinding(){
    return {
      childCount: ((sender, node)=> {
        const data = sender.get(node.id);
        const count = data.childCount;
        return Number(count) ? `
          <g class="js-named-map-count gs-named-map-count js-tooltip-info gs-card-action-icon ${count ? '' : 'action-disabled'}" transform="translate(${(ca.nodeWidth/2) - 20}, ${ca.nodeHeight - 20})">
          <rect style="fill:#ffffff; stroke-width:1.5px;stroke:#0F87EC;" width="${ca.countWidth}" height="${ca.countHeight}" rx="16" ry="16"/>
            <text x="18" y="18" class="text-count" style="text-anchor: middle;">${count}</text>
            <path d="M27 13 L31 8.5 L35 13" style="stroke:#0F87EC" class="${node.collapsedChildrenIds.length ? 'not-expand': 'expand'}"></path>
          </g>` : "";
      })
    };
  }

  protected getNameNodeBinding() {
    return {
      name: ((sender, node) => {
        const name = sender.get(node.id).name;
        const nodesList = this.hierarchyService.isValidHTMLTagFromString(name, this.ALLOWED_HTML_TAG_FOR_STRING_DTS.join(','));
        if(nodesList.length){
          const htmlEle:any = this.hierarchyService.toConvertHTML(name);
          htmlEle.innerText = addEllipsis(htmlEle.innerText, 20)
          const label = htmlEle.outerHTML ? addEllipsis(escape(htmlEle.outerHTML), 30) : "---";
          return `<title>${escape(name)}</title><text style="fill:#2B3643; font-size:${ca.nameFontSize}px; font-weight:900; height:${this.calcChartAttributes.nameHeight}px" x="${this.calcChartAttributes.textPaddingX}" y="${this.calcChartAttributes.namePaddingY}">${label}</text>`;
        }else{
          return `<title>${name}</title><text style="fill:#2B3643; font-size:${ca.nameFontSize}px; font-weight:900; height:${this.calcChartAttributes.nameHeight}px" x="${this.calcChartAttributes.textPaddingX}" y="${this.calcChartAttributes.namePaddingY}">${addEllipsis(name, 25)}</text>`;
        }
      })
    };
  }

  private getAdditionalNodeBinding(){
    const peopleInfoNodeBinding = {};
    const columns = this.config.filter(x => (x.fieldName === "Name" && !x.fieldPath) ? false : !x.hidden);
    let padding = 25;
    let isAfterCurrency = false;
    columns.forEach((column, idx) => {
      peopleInfoNodeBinding[column.fieldAlias] = ((sender, node)=> {
        if(!idx) {
          padding = 25;
          isAfterCurrency = false;
        }
        const peopleInfo = sender.get(node.id)[column.fieldAlias];
        const isImmediatelyAfterCurrency = idx > 2;
        padding = isImmediatelyAfterCurrency ? padding + 15 : isAfterCurrency ? 45 : padding;
        isAfterCurrency = isAfterCurrency ? isAfterCurrency : isImmediatelyAfterCurrency;
        let truncatedLimit = 21;
        let label = addEllipsis(column.label, truncatedLimit) + ": ";
        const nodesList = this.hierarchyService.isValidHTMLTagFromString(peopleInfo.fv, this.ALLOWED_HTML_TAG_FOR_STRING_DTS.join(','));
        if(column.dataType === DataTypes.STRING && nodesList.length){
          truncatedLimit =  15;
          const htmlEle:any = this.hierarchyService.toConvertHTML(peopleInfo.fv);
          htmlEle.innerText = addEllipsis(htmlEle.innerText, truncatedLimit);
          label += column.meta.mappings ? addEllipsis(escape(htmlEle.outerHTML), 25): htmlEle.outerHTML ? htmlEle.outerHTML : "---";
        } else {
          truncatedLimit = 28;
          label += peopleInfo.fv ? peopleInfo.fv : "---";
          label = addEllipsis(label,truncatedLimit);

        }
        let incrementStep = 1;
        const index = idx + incrementStep;
        if(column.dataType === DataTypes.STRING && this.hierarchyService.isValidHTMLTagFromString(peopleInfo.fv, this.ALLOWED_HTML_TAG_FOR_STRING_DTS.join(','))){
          return `<g transform="translate(${this.calcChartAttributes.textPaddingX}, ${(this.calcChartAttributes.paddingY * index) + padding})"><title>${escape(peopleInfo.fv)}</title><text style="font-size:${ca.peopleInfoFontSize}px; height:${this.calcChartAttributes.nameHeight}px;  fill:#30363f">${label}</text></g>`
        }
        if(column.dataType === DataTypes.CURRENCY && idx > incrementStep) {
          truncatedLimit = 6;
          return `
          <g fill="#e3eaf1" transform="translate(${this.calcChartAttributes.textPaddingX}, ${(this.calcChartAttributes.paddingY * index) + padding - 20})">
          <title>${column.label}</title>
          <rect width="50" height="20" rx="4" ry="4" style="stroke:#D2D8DC"/>
          <text style="font-size:${ca.peopleInfoFontSize}px; height:${this.calcChartAttributes.nameHeight}px; text-anchor: middle;  fill:#000000" x="25" y="15">
          ${addEllipsis(column.label,truncatedLimit)}
          </text>
          </g>
          <g fill="#ffffff" transform="translate(${this.calcChartAttributes.textPaddingX + 50}, ${(this.calcChartAttributes.paddingY * index) + padding - 20})">
          <title>${peopleInfo.fv}</title>
          <rect width="100" height="20" rx="4" ry="4" style="stroke:#D2D8DC"/>
          <text style="font-size:${ca.peopleInfoFontSize}px; height:${this.calcChartAttributes.nameHeight}px; text-anchor: middle; fill:#000000" x="45" y="15">
          ${addEllipsis(peopleInfo.fv ? peopleInfo.fv : "---", 15)}
          </text>
          </g>`
        } else if(column.fieldName === "CurrentScore" || idx > incrementStep) {
          if(!peopleInfo.fv) {
            return `
                <g fill="#fff" transform="translate(${this.calcChartAttributes.textPaddingX}, ${(this.calcChartAttributes.paddingY * index) + padding - 20})">
                <title>Label: NA</title>
                <rect e-c="${node.id}" rx="12" ry="12" x="0" y="0" width="50" height="24" style="fill:#fff; stroke-width:2px;stroke:rgba(184,200,216,.3);"></rect>
                <text style="font-size: 14px; cursor: pointer;" fill="#7596B7" x="28" y="17" text-anchor="middle" > NA</text>
              </g>`
          }
          switch(peopleInfo.properties.schemeType) {
            case 'NUMERIC':
              return this.getNumericScore(peopleInfo, node, index, padding);
            case 'GRADE':
              return `
                <g fill="${peopleInfo.properties.color}"  transform="translate(${this.calcChartAttributes.textPaddingX}, ${(this.calcChartAttributes.paddingY * index) + padding - 20})">
                <title>Score: ${peopleInfo.properties.score}</title>
                <rect e-c="${node.id}" rx="12" ry="12" x="0" y="0" width="50" height="24" style="fill:${peopleInfo.properties.color}; stroke-width:2px;stroke:${peopleInfo.properties.color};"></rect>
                <text style="font-size: 14px; cursor: pointer;" fill="#ffffff" x="28" y="17" text-anchor="middle" > ${peopleInfo.properties.label}</text>
              </g>`
            case 'COLOR':
              return `
                <g fill="${peopleInfo.properties.color}"  transform="translate(${this.calcChartAttributes.textPaddingX}, ${(this.calcChartAttributes.paddingY * index) + padding - 20})">
                <title>Label:${peopleInfo.properties.label}, Score: ${peopleInfo.properties.score}</title>
                <rect e-c="${node.id}" rx="12" ry="12" x="0" y="0" width="50" height="24" style="fill:${peopleInfo.properties.color}; stroke-width:2px;stroke:${peopleInfo.properties.color};"></rect>
              </g>`
          }
        }
        return `<g transform="translate(${this.calcChartAttributes.textPaddingX}, ${(this.calcChartAttributes.paddingY * index) + padding})"><title>${peopleInfo.fv}</title><text data-nodeId="${peopleInfo.fv}" style="font-size:${ca.peopleInfoFontSize}px; height:${this.calcChartAttributes.nameHeight}px;  fill:#30363f">${label}</text></g>`
      })
    });
    return peopleInfoNodeBinding;
  }

  private getNumericScore(peopleInfo: any, node: any, index: number, padding: number) {
    switch(peopleInfo.properties.trend) {
      case "1": 
      return `
      <g fill="${peopleInfo.properties.color}"  transform="translate(${this.calcChartAttributes.textPaddingX}, ${(this.calcChartAttributes.paddingY * index) + padding - 20})">
      <title>Label: ${peopleInfo.properties.label}</title>
      <rect e-c="${node.id}" rx="12" ry="12" x="0" y="0" width="50" height="24" style="fill:${peopleInfo.properties.color}; stroke-width:2px;stroke:${peopleInfo.properties.color};"></rect>
      <g transform="translate(10,5)" fill="none" fill-rule="evenodd">
        <g fill="#FFF" fill-rule="nonzero">
          <g>
            <g>
              <g>
                <path d="M7.427 9.027l3.355-4.697c.169-.236.114-.564-.122-.732-.09-.064-.196-.098-.305-.098h-6.71c-.29 0-.525.235-.525.525 0 .11.034.216.098.305l3.355 4.697c.168.236.496.29.732.122.047-.034.089-.075.122-.122z" transform="translate(-88.000000, -90.000000) translate(80.000000, 36.000000) translate(0.000000, 50.000000) translate(15.000000, 11.125000) scale(1, -1) translate(-15.000000, -11.125000) translate(8.000000, 4.125000)"/>
              </g>
            </g>
          </g>
        </g>
      </g>
      <text style="font-size: 14px; cursor: pointer;" fill="#ffffff" x="33" y="17" text-anchor="middle" > ${peopleInfo.properties.score}</text>
      </g>`
      case "-1": 
      return `
      <g fill="${peopleInfo.properties.color}"  transform="translate(${this.calcChartAttributes.textPaddingX}, ${(this.calcChartAttributes.paddingY * index) + padding - 20})">
      <title>Label: ${peopleInfo.properties.label}</title>
      <rect e-c="${node.id}" rx="12" ry="12" x="0" y="0" width="50" height="24" style="fill:${peopleInfo.properties.color}; stroke-width:2px;stroke:${peopleInfo.properties.color};"></rect>
      <path fill="#FFF" d="M7.427 9.902l3.355-4.697c.169-.236.114-.564-.122-.732-.09-.064-.196-.098-.305-.098h-6.71c-.29 0-.525.235-.525.525 0 .11.034.216.098.305l3.355 4.697c.168.236.496.29.732.122.047-.034.089-.075.122-.122z" transform="translate(10,5)"/>
      <text style="font-size: 14px; cursor: pointer;" fill="#ffffff" x="33" y="17" text-anchor="middle" > ${peopleInfo.properties.score}</text>
      </g>`
      case "0":
      return `
      <g fill="${peopleInfo.properties.color}"  transform="translate(${this.calcChartAttributes.textPaddingX}, ${(this.calcChartAttributes.paddingY * index) + padding - 20})">
      <title>Label: ${peopleInfo.properties.label}</title>
      <rect e-c="${node.id}" rx="12" ry="12" x="0" y="0" width="50" height="24" style="fill:${peopleInfo.properties.color}; stroke-width:2px;stroke:${peopleInfo.properties.color};"></rect>
      <g transform="translate(10,5)">
        <path fill="#FFF" fill-opacity="0" d="M0 0H14V14H0z" transform="translate(-162.000000, -91.000000) translate(80.000000, 36.000000) translate(74.000000, 50.000000) translate(8.000000, 5.000000)"/>
        <path fill="#FFF" d="M5.86 3.092c.21-.163.393-.078.393.199v7.418c0 .276-.176.366-.394.198L1.17 7.303c-.211-.163-.217-.439 0-.606zm2.28 0l4.69 3.605c.218.167.212.443 0 .606l-4.69 3.604c-.217.168-.393.078-.393-.198V3.29c0-.277.182-.362.394-.199z" transform="translate(-162.000000, -91.000000) translate(80.000000, 36.000000) translate(74.000000, 50.000000) translate(8.000000, 5.000000)"/>
      </g>
      <text style="font-size: 14px; cursor: pointer;" fill="#ffffff" x="33" y="17" text-anchor="middle" > ${peopleInfo.properties.score}</text>
      </g>`
      default: 
      return `<g fill="${peopleInfo.properties.color}"  transform="translate(${this.calcChartAttributes.textPaddingX}, ${(this.calcChartAttributes.paddingY * index) + padding - 20})">
      <title>Label: ${peopleInfo.properties.label}</title>
      <rect e-c="${node.id}" rx="12" ry="12" x="0" y="0" width="50" height="24" style="fill:${peopleInfo.properties.color}; stroke-width:2px;stroke:${peopleInfo.properties.color};"></rect>
      <text style="font-size: 14px; cursor: pointer;" fill="#ffffff" x="27" y="17" text-anchor="middle" > ${peopleInfo.properties.score}</text>
      </g>`
    }
  }


}
