import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { StateAction } from '@gs/gdk/core';

@Component({
  selector: 'gs-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent implements OnInit {

  @Input() item: any;

  @Input() config: any = {showActionButton: true, showDragHandler: true}

  @Output() action = new EventEmitter<StateAction>();

  constructor() { }

  ngOnInit() {
  }

  deleteItem(evt: MouseEvent | TouchEvent, item): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.action.emit({
      type: 'DELETE',
      payload: item
    });
  }

  customizeItem(evt: MouseEvent | TouchEvent, item): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.action.emit({
      type: 'CUSTOMIZED',
      payload: item
    })
  }

  onAction(evt: StateAction) {
    const { payload } = evt;
    this.item.label = payload;
    this.action.emit(evt)
  }

}
