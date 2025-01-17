import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'gs-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss']
})
export class EmptyComponent implements OnInit {

  @Input() public section;
  @Input() public label = "";
  @Input() public showNoSectionsImage = false;

  displayLabel = "";
  constructor() { }

  ngOnInit() {
    this.displayLabel =  this.label ? this.label : this.section.label ;
  }

}
