import {Component, EventEmitter, Input, OnInit, Output, ViewChild, SimpleChanges} from '@angular/core';
import { StateAction } from '@gs/gdk/core';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";

@Component({
  selector: 'gs-item-drop-list',
  templateUrl: './item-drop-list.component.html',
  styleUrls: ['./item-drop-list.component.scss']
})
export class ItemDropListComponent implements OnInit {

  @Input() options: any;

  @Input() items: any;

  @Input() extras: any;

  @Input() showEmptyDropList: boolean = false;

  @Input() allowCustomPlaceholderGrid: boolean = false;

  @Input() singleColumn: boolean = false;

  @Input() emptyAreas: number = 0;

  @Output() action = new EventEmitter<StateAction>();

  @ViewChild('droplistgridster', {static: false}) gridster: any;

  highlight: boolean = false;
  emptyAreasArray: any[] = [];

  get value() {
    if(this.gridster) {
      return this.gridster.grid.map(({item}) => item);
    }
  }

  get gridsterCustomPlaceholderItemWidth(): number {
    if(this.gridster) {
      return (this.gridster.el.offsetWidth - 30) / 2;
    }
  }

  public messageConstants = {
    description: 'Drag and Drop reports from left side panel to add them to this section'
  }

  constructor() { }

  ngOnInit() {
    this.bootstrapComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.emptyAreas) {
      this.emptyAreasArray = new Array(this.emptyAreas);
    }
  }

  bootstrapComponent(): void {
    this.messageConstants = {...this.messageConstants, ...this.extras};
  }

  trackBy(index: number, item: any): number {
    return item.itemId;
  }

  onItemDrop($event: CdkDragDrop<any>) {
    if($event.container === $event.previousContainer) {
      const disabledItems = this.items.filter(item => !(item.dragEnabled === undefined ? true: item.dragEnabled));
      // Adding disabledItems.length to the prev and curr index to ignore the items which are dragDisabled
      moveItemInArray(this.items, $event.previousIndex + disabledItems.length, $event.currentIndex + disabledItems.length);
      this.action.emit({
        type: 'ITEM_REARRANGED',
        payload: null
      });
    } else {
      const { item } = $event;
      this.action.emit({
        type: 'ITEM_DROPPED',
        payload: item.data
      })
    }
  }

  onItemEnter($event: CdkDragDrop<any>) {
    this.action.emit({
      type: 'ITEM_ENTERED',
      payload: null
    });

    this.checkForHighlight($event);
  }

  checkForHighlight(event) {
    this.highlight = !!(event.item && event.item.data);
  }

  onItemExit($event: CdkDragDrop<any>) {
    this.action.emit({
      type: 'ITEM_EXITED',
      payload: null
    })
  }

  onItemAction(evt: StateAction) {
    const { type, payload } = evt;
    switch (type) {
      case 'DELETE':
        this.deleteItem(payload);
        this.action.emit(evt);
        break;
      case 'TEXT_EDITED':
        this.action.emit({
          type: 'TEXT_EDITED',
          payload: null
        });
        break;
      case 'CUSTOMIZED':
        this.action.emit(evt);
        break;
      default: null
    }
  }

  deleteItem(item): void {
    this.items.splice(this.items.indexOf(item), 1);
  }

}
