import {
  Component, ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { forkJoin, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DescribeService } from "@gs/gdk/services/describe";
import {calculateAttrsNCellsToShow, EventType, MDA_HOST, attrConfigSort} from '@gs/cs360-lib/src/common';
import { CSMAttributeService } from '../csm-attribute.service';
import { DataTypes, PxService, PX_CUSTOM_EVENTS, WidgetTypes } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-csm-attribute-group-mini',
  templateUrl: './csm-attribute-group-mini.component.html',
  styleUrls: ['./csm-attribute-group-mini.component.scss']
})
export class CsmAttributeGroupMiniComponent implements OnInit {


  @Input() fields = [];
  @Input() data = {};
  @Input() ctx;
  @Input() isGroup = true;
  @Input() widgetItem;
  @Input() section: any;
  @Input() context;
  @Input() showAll = false;
  @Output() updates = new EventEmitter<any>();
  @ViewChild('attrContainer', { static: false }) attrContainer: ElementRef;
  editMode = [];
  loaders = 0;
  treeData = null;
  loaded = false;

  isTooltipVisible = false;
  currentFields: any[];

  constructor(private _ds: DescribeService,
    private attrService: CSMAttributeService,
    public pxService: PxService,
              public elementRef: ElementRef
    ) { }

  ngOnInit() {
    this.populateTreeData();
    this.fields = this.fields && attrConfigSort(this.fields);
    if(this.showAll) {
      this.currentFields = this.fields;
    } else {
      const fieldsToShowInitially = calculateAttrsNCellsToShow(this.fields).initialAttrsToShow;
      this.currentFields = this.fields.slice(0, fieldsToShowInitially);
    }
  }

    public async populateTreeData(){
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

  onUpdate(event, item) {
    const source = item.dataType === WidgetTypes.RICHTEXTAREA ? WidgetTypes.RICHTEXTAREA_EDIT : this.context;
    this.pxService.pxAptrinsic(PX_CUSTOM_EVENTS.DATA_EDIT, {Source: source});
    this.updates.emit({...event, item});
  }

  tooltipVisible(evt:any){
    this.isTooltipVisible = evt;
  }

  editStateChanged(inEditMode, index) {
    if (this.currentFields[index] && this.currentFields[index].dataType === DataTypes.RICHTEXTAREA) {
      setTimeout(() => {
        /* on edit, outer summary gridster needs to be resized based on group height. */
        this.updates.emit({type: EventType.RESIZE, data: this.getGroupHeight()});
      })
    }
  }

  resizeItem({viewAll}) {
    const fieldsShownInitially = calculateAttrsNCellsToShow(this.fields).initialAttrsToShow;
    if(viewAll) {
      this.currentFields = this.fields;
    } else {
      this.currentFields = this.fields.slice(0, fieldsShownInitially);
    }
  }
  getGroupHeight() {
    return this.attrContainer.nativeElement.offsetHeight;
  }
}
