import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import { forkJoin, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DescribeService } from "@gs/gdk/services/describe";
import { GRIDSTER_DEFAULTS } from '@gs/gdk/widget-viewer';
import { GridsterComponent, GridsterConfig } from 'angular-gridster2';
import { CompactType, DisplayGrid, GridType, GridsterItemComponent, GridsterPush } from 'angular-gridster2';
import {isMini360, MDA_HOST} from '@gs/cs360-lib/src/common';
import { CSMAttributeService } from '../csm-attribute.service';
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import { SUMMARY_GRIDSTER_DEFAULTS } from '@gs/cs360-lib/src/common';
import { DataTypes } from '@gs/cs360-lib/src/common';
import { PxService } from '@gs/cs360-lib/src/common';
import { PX_CUSTOM_EVENTS, WidgetTypes } from '@gs/cs360-lib/src/common';
import { isEmpty } from 'lodash';

const COMMON_OPTIONS: GridsterConfig = {
  displayGrid: DisplayGrid.None,
  draggable: {
    enabled: true,
    ignoreContent: true,
  },
  scrollToNewItems: false,
  resizable: {
    enabled: false
  },
}

@Component({
  selector: 'gs-csm-attribute-group',
  templateUrl: './csm-attribute-group.component.html',
  styleUrls: ['./csm-attribute-group.component.scss']
})
export class CsmAttributeGroupComponent implements OnInit {

  options: GridsterConfig;
  public ctnHeight = '400px';
  @Input() fields = [];
  @Input() data = {};
  @Input() ctx;
  @Input() widgetItem;
  @Input() section: any;
  @Input() context;
  @Output() updates = new EventEmitter<any>();
  @ViewChild('popover', { static: false }) private popover: NzOverlayComponent;
  @ViewChild('gridster1', { static: false }) gridster: GridsterComponent;
  @ViewChildren(GridsterItemComponent) gridsterItemComponentArray: GridsterItemComponent[];
  maxCols;
  editMode = [];
  loaders = 0;
  configuredAxisDetailsMap;
  configuredDimensionsMap;
  columnsAsPerConfig;
  treeData = null;
  loaded = false;
  isMini = false;

  showGridster = true;
  isTooltipVisible = false;

  constructor(private _ds: DescribeService,
              private attrService: CSMAttributeService,
              private cdr: ChangeDetectorRef,
              public pxService: PxService
  ) { }

  ngOnInit() {
    const isZoom = Object.keys(this.ctx.zoomPlatformData || {}).length > 0;
    this.isMini = isMini360(this.ctx);
    this.populateTreeData();
    let rows = 1000;
    console.log("in init");
    let cols = 4;
    this.saveConfiguredAxisDetailsAndDimensions();
    if (this.widgetItem) {
      rows = (this.widgetItem && this.widgetItem.rows) || (this.widgetItem && this.widgetItem.dimensionDetails && this.widgetItem.dimensionDetails.rows);
      cols = (this.widgetItem && this.widgetItem.cols) || (this.widgetItem && this.widgetItem.dimensionDetails && this.widgetItem.dimensionDetails.cols);
      this.options = {
        ...SUMMARY_GRIDSTER_DEFAULTS.ATTRIBUTE_WIDGET_CSM_VIEW(cols),
        ...COMMON_OPTIONS,
        fixedRowHeight:  56,
        margin: 0,
        itemInitCallback: (event) => {
          if(this.loaders > 0) {
            this.loaders--;
          }
        },
        // setGridSize: usage of this property is to have a responsive grid based on screen size
        setGridSize: isZoom ? true : false
      };

      this.fields = this.fields.map(fld => {
        if(!fld.axisDetails) {
          const { x,y } = fld;
          fld.axisDetails = {x, y};
        }
        fld = {
          ...fld,
          ...fld.axisDetails
        }

        return fld;
      });
      this.maxCols = this.getMaxCols(cols);
    } else {
      this.options = {
        ...GRIDSTER_DEFAULTS(true),
        ...COMMON_OPTIONS,
        resizable: {
          enabled: false,
          handles: {s: true, e: false, n: false, w: false, se: true, ne:false, sw: false, nw: false},
          start: (item, gridsterItem, event) => {
            // When drag starts, double the height of gridster so that it has some room to change item height. otherwise it was flickering while increasing height.
            const height = Math.max(this.gridster.el.getBoundingClientRect().height, 700);
            this.gridster.el.style.height = height * 2 + 'px';
          },
          stop: (item, gridsterItem, event) => {
            // this.resizeStop.emit({item, gridsterItem, event});
            this.options.api.resize();
          },
        },
        gridType: GridType.VerticalFixed,
        compactType: CompactType.CompactUpAndLeft,
        setGridSize: true,
        fixedRowHeight: 85,
        margin: 0,
        cols,
        minCols: cols,
        minRows: 1,
        maxRows: rows,
        maxCols: cols,
        itemInitCallback: (event) => {
          // console.log('* * * * * * * * itemInitCallback', event);
          if(this.loaders > 0) {
            this.loaders--;
          }
        },
      };
      this.maxCols = 4;
      this.fields.forEach(item => {
        // let maxRows, rows, minRows;
        // maxRows = rows = minRows = 1;
        // let maxCol = 1;
        if (item.dataType === "RICHTEXTAREA") {
          // maxRows = 10;
          // rows = 2;
          // minRows = 1;
          // maxCol = item.properties.width ? item.properties.width : 4;
          item.resizeEnabled = true;
          item["maxItemRows"] = 10;
        }
        // item["rows"] = rows;
        // item["cols"] = maxCol;
        // item["maxItemRows"] = maxRows;
        // item["minItemCols"] = maxCol;
        // item["minItemRows"] = minRows;
        item["x"] = item.axisDetails && item.axisDetails.x;
        item["y"] = item.axisDetails && item.axisDetails.y;
      });
    }
  }

  public async populateTreeData(){
    // In case of summary preview, ctx would be empty. Need to figure out how to alter ctx in this case. Till then applying null check
    if(isEmpty(this.ctx)) {
      this.loaded = true;
      return;
    }
    // Populating tree data from here and passing it to the child components for checking mapped field
    if(this.ctx.associatedObjects && this.ctx.associatedObjects.length){
      forkJoin([this.ctx.baseObject,...this.ctx.associatedObjects ].map((object)=>{
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

  /**
   * Store original axisDetails & dimensions of fields (original positions & dimensions) because it will be overridden on window resize (re-calculate new positions based on available width)
   * So when you resize and make it small and later resize and come back to initial width, now it should apply saved dimensionDetails (original positions)
   * instead of re-caclculating.
   */
  saveConfiguredAxisDetailsAndDimensions(): void {

    this.configuredAxisDetailsMap = {};
    this.configuredDimensionsMap = {};

    (this.widgetItem ? this.widgetItem.config : this.fields).forEach(field => {

      if(!field.axisDetails) {
        field.axisDetails = {};
      }

      this.configuredAxisDetailsMap[field.itemId] = {
        x: field.axisDetails.x,
        y: field.axisDetails.y,
      };

      if(!field.dimensionDetails) {
        field.dimensionDetails = {};
      }

      this.configuredDimensionsMap[field.itemId] = {
        rows: field.dimensionDetails.rows,
        cols: field.dimensionDetails.cols,
      };
    });

    this.columnsAsPerConfig = this.widgetItem ? this.widgetItem.cols/4 : 4;

    // console.log('%c See this ->','font-size: 25px; font-weight: bold;', this.widgetItem.label, this.configuredAxisDetailsMap, this.columnsAsPerConfig);
  }

  onUpdate(event, item) {
    const source = item.dataType === WidgetTypes.RICHTEXTAREA ? WidgetTypes.RICHTEXTAREA_EDIT : this.context;
    this.pxService.pxAptrinsic(PX_CUSTOM_EVENTS.DATA_EDIT, {Source: source});
    this.updates.emit({...event, item});
  }

  getMaxCols(cols) {
    if (cols === 2) {
      return 3;
    }
    if (cols === 3) {
      return 4;
    }
    if (cols === 1) {
      return 3;
    }

    return 6;
  }

  colsChanged(currentCols) {
    this.showGridster = false;
    this.loaders = this.fields.length;
    setTimeout(() => {
      this.options = {
        ...this.options,
        cols: currentCols,
        minCols: currentCols,
        maxCols: currentCols,
      };

      // If used in summary widget, delete fields's rows and cols which will trigger autoPosition of the widget in gridster.
      if(this.widgetItem) {
        if(currentCols == this.columnsAsPerConfig) {
          // console.log('>>>>>>>', this.widgetItem.label, cols);

          this.fields.forEach(fld => {
            fld.rows = fld.cols = 1;
            // resetting original x & y
            const {x, y} = this.configuredAxisDetailsMap[fld.itemId] || fld.axisDetails;
            fld.x = x;
            fld.y = y;
          });
        } else {
          this.fields.forEach(fld => {
            delete fld.rows;
            delete fld.cols;
            delete fld.dimensionDetails;
          });
        }
      }
      else {

        // Coming back to original width, so apply original positions & dimensions
        if(currentCols == this.columnsAsPerConfig) {
          this.fields.forEach(fld => {
            const {x, y} = this.configuredAxisDetailsMap[fld.itemId] || fld.axisDetails;
            fld.x = x;
            fld.y = y;

            const { rows, cols } = this.configuredDimensionsMap[fld.itemId] || fld.axisDetails;
            fld.rows = rows;
            fld.cols = cols;
          });
        } else {
          this.fields.forEach(fld => {
            const { rows, cols } = this.configuredDimensionsMap[fld.itemId] || fld.axisDetails;
            fld.rows = rows;
            fld.cols = Math.min(cols, currentCols);
          })
        }
      }

      this.showGridster = true;
    }, 0);

  }

  tooltipVisible(evt:any){
    this.isTooltipVisible = evt;
  }

  editStateChanged(inEditMode, index) {
    this.editMode[index] = inEditMode;

    if(this.fields[index] && this.fields[index].dataType === DataTypes.RICHTEXTAREA) {
      const gridsterItemComponent = this.gridsterItemComponentArray.filter((e, i) => i=== index)[0];
      if(inEditMode) {
        const minRows = this.getMinRows(gridsterItemComponent);
        gridsterItemComponent.$item.minItemRows = minRows;
        const push = new GridsterPush(gridsterItemComponent); // init the service
        if(gridsterItemComponent.$item.rows < minRows) {
          gridsterItemComponent.$item.rows = minRows;
        }
        push.pushItems(push.fromNorth);
        push.setPushedItems(); // save the items pushed
        push.restoreItems(); // restore to initial state the pushed items
        push.checkPushBack(); // check for items restore to original position
        this.options.api.resize();
      } else {
        gridsterItemComponent.$item.minItemRows = 1;
      }
    }
  }

  private getMinRows(gridsterItemComponent: GridsterItemComponent): number {
    return gridsterItemComponent.el.getBoundingClientRect().width < 400 ? 5 : 3;
  }
}
