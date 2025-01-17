import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  Renderer2,
  ViewChild,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  DoCheck,
} from '@angular/core';
import { IMapOptions } from './pojos/IMap';
import { CHART_ATTRIBUTES as ca } from './map.constant';
import { MapService } from './map.service';
import { addEllipsis, filterExistingIds } from './map.utils';
import OrgChart from '@gs/cs360-lib/assets/js/orgchart.js';
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import {EnvironmentService} from "@gs/gdk/services/environment";

@Component({
  selector: 'gs-map',
  template: '',
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit, OnDestroy, OnInit, DoCheck{
  @ViewChild('mapRoot',{static:false}) mapRoot:ElementRef;
  @ViewChild('popover', { static: false })
  protected popover: NzOverlayComponent;
  @Input() data;
  @Input() renderParams:IMapOptions;
  @Output()
  action:EventEmitter<{type:string; node:object, DOMTarget:HTMLElement}> = new EventEmitter();
  protected nodeFieldsArray:string[];
  protected graph:any; // OrgChart
  protected map; // Instance of the map
  protected calcChartAttributes;
  protected template:string;
  private unlistenFuncArr:Array<()=> void> = [];
  private targetNodeVal;
  private parentTargetNodeVal;
  private targetNodeDOMElement;

  constructor(protected mapService:MapService,
              @Inject("envService") protected env: EnvironmentService,
              protected renderer:Renderer2,
              protected elementRef:ElementRef,
              protected cdr:ChangeDetectorRef){

  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.initialise();
  }
  
  protected initialise() {
    this.graph = OrgChart;
    this.nodeFieldsArray = ['name'];
    this.setChartAttributes();
    this.drawMap();
  }
  
  ngDoCheck(){
  }

  private addEventListeners(){
    const eventCallbackHash = this.getEventListeners();
    for (const item in eventCallbackHash){
      const selectors = Array.from(this.elementRef.nativeElement.querySelectorAll(eventCallbackHash[item].selector));
      selectors.forEach((selector, j) => {
        const unlistenFunc = this.renderer.listen(
          selector,
          eventCallbackHash[item].eventName,
          eventCallbackHash[item].callback.bind(this),
        );
        this.unlistenFuncArr.push(unlistenFunc);
      });
    }
  }

  protected getEventListeners() {
    return [];
  }

  protected setChartAttributes(){
    this.calcChartAttributes = {
      textPaddingX : ca.nodePadding + 2*ca.imageCircleRadius + 8,
      namePaddingY: ca.nodePadding + ca.nameHeight,
    };
  }


  protected drawMap(){
    this.template = this.renderParams.template || 'customTemplate';
    this.graph.templates[this.template]  =  { ...this.graph.templates.ula };
    this.graph.templates[this.template].size = [ca.nodeWidth, ca.nodeHeight];
    this.graph.templates[this.template].node = this.getTemplateNode();
    this.graph.templates[this.template].link = this.getLink();
    this.graph.templates[this.template].minus = '';	
    this.graph.templates[this.template].plus = '';
    this.graph.templates[this.template].ripple = {
      color: ca.rippleColor,
      radius: ca.rippleRadius,
    };
    this.graph.templates[this.template].defs += `<filter id="linear">
			<feGaussianBlur in="SourceGraphic" stdDeviation="4" />
		</filter>`;
    for (const field of this.nodeFieldsArray){
      this.graph.templates[this.template][field] = this.getVal();
    }
    this.setMapOptions();
    this.loadData();
  }

  private getTemplateNode() {
    return `<rect width="${this.calcChartAttributes.nodeWidth}" height="${this.calcChartAttributes.nodeHeight}" rx="4" ry="4" style="fill:#FFFFFF; stroke:#D2D8DC"/>`;
  }

  private getLink() {
    return `<path style="stroke:#C9D4E0; stroke-width: 1px" fill="none" d="M{xa},{ya} {xb},{yb} {xc},{yc} L{xd},{yd}"/>`;
  }

  private getVal() {
    return '{val}';
  }
  private setMapOptions() {
    const chartElm = this.mapRoot.nativeElement;
    this.graph.SCALE_FACTOR = ca.scaleFactor;
    this.graph.RES.IT_IS_LONELY_HERE_LINK = '';
    this.graph.CLINK_CURVE = 1.75;
    this.graph.MAX_DEPTH = 1000;
    this.map = new this.graph(chartElm, this.getGraphRenderObject(chartElm));
    this.map.on("init", () => {
      this.map.center(this.renderParams.primaryNode, {
        rippleId: 1,
        vertical: true,
        horizontal: false
      });
    });
    this.map.on("redraw", () => {
      this.retainNodeSelection();
      this.addEventListeners();
      const currentScale = this.mapService.getScale(this.map);
      if(currentScale > ca.scaleMax){
        this.mapService.zoom(this.map,0.99/currentScale);
      }else if(currentScale < ca.scaleMin){
        this.mapService.zoom(this.map,true);
      }
    });
    this.map.on('click', (sender) => {
      return false;
    });
  };

  private getGraphRenderObject(chartElm){
    // TODO: Need to check diff. parameters for diff. layouts
    return {
      lazyLoading: true,
      enableDragDrop: this.renderParams.enableDragDrop || false,
      scaleInitial: 0.8,
      showXScroll: OrgChart.scroll.visible,
      showYScroll: OrgChart.scroll.visible,
      template: this.template,
      levelSeparation: this.renderParams.levelSeparation || ca.levelSeparation,
      mixedHierarchyNodesSeparation: this.renderParams.mixedHierarchyNodesSeparation || ca.mixedHierarchyNodesSeparation,
      siblingSeparation: 100,
      subtreeSeparation: 40,
      layout: this.graph[this.renderParams.layout] || this.graph.normal,
      scaleMin: this.renderParams.scaleMin || ca.scaleMin,
      scaleMax: this.renderParams.scaleMax || ca.scaleMax,
      enableSearch: this.renderParams.enableSearch || false,
      mouseScrool: OrgChart.action.none,
      nodeBinding: this.getNodeBinding()
    };
  }

  zoomIn(){
		this.map.zoom(true);
	}
  
	zoomOut(){
    this.map.zoom(false);
	}
  
	zoomFit(){
    this.map.fit();
	}


  private retainNodeSelection(){
    if(this.renderParams.primaryNode){
      const node = this.map.getNodeElement(this.renderParams.primaryNode);
      node && node.querySelector('rect').classList.add("primary");
    }
  }

  protected getNodeBinding() {
    return {
      name: ((sender, node) => {
        const name = sender.get(node.id).name;
        return `<text style="fill:#2B3643; font-size:${ca.nameFontSize}px; font-weight:900; height:${ca.nameHeight}" x="${this.calcChartAttributes.textPaddingX}" y="${this.calcChartAttributes.namePaddingY}">${addEllipsis(name)}</text>`;
      })
    };
  }

  private loadData(data?){
    this.map.load(this.data);
  }

  public executeAction(event, type:string){
    this.action.emit({type, node:this.targetNode, DOMTarget: this.targetNodeDOMElement});
    this.popover.close();
  }

  get targetNode(){
    return this.targetNodeVal;
  }

  // Sets the target node for the current operation like expand/add/remove
  set targetNode(id){
    this.targetNodeVal = this.mapService.get(this.map, id);
  }

  get parentTargetNode(){
    return this.parentTargetNodeVal;
  }

  // Sets the parent target node for the remove operation
  set parentTargetNode(node){
    this.parentTargetNodeVal = this.data.filter((item) => item.id === node.pid)[0];
  }

  /**
   * It gets the data for the new nodes to be added
   * and adds them to the target node and updates the counts
   * of the target node
   * Override this method to include consumer specific logic
   */
  public updateData(newNodes,parentId){
    for(const node of newNodes.mapData){
      this.mapService.add(this.map,node);
    }
    const parentNode = this.mapService.get(this.map,parentId);
    this.mapService.draw(this.map);
  }

  private removeEventListeners(){
    for (const index in this.unlistenFuncArr){
      this.unlistenFuncArr[index]();
    }
    this.unlistenFuncArr = [];
  }

  public hasNodes (){
    return this.mapService.getNodes(this.map).length > 0;
  }

  public filterExistingIds(newData) {
    return filterExistingIds(this.mapService.getNodes(this.map), newData);
  }

  public trackByActionType(index, action){
    return action.type;
  }

  ngOnDestroy(){
    this.removeEventListeners();
  }
}
