import {Component, Input, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'gs-list-item-sort',
  templateUrl: './list-item-sort.component.html',
  styleUrls: ['./list-item-sort.component.scss']
})
export class ListItemSortComponent implements OnInit {

  @Input() items: any[];

  constructor() { }

  get sortedItems(): any[] {
    if(!!this.items) {
      return this.items;
    }
  }

  ngOnInit() {
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }

}
