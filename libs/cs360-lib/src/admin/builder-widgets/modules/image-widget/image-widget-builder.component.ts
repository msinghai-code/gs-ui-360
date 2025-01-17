import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'gs-image-widget-builder',
  templateUrl: './image-widget-builder.component.html',
  styleUrls: ['./image-widget-builder.component.scss']
})
export class ImageWidgetBuilderComponent implements OnInit {

  @Input() properties;
  constructor() { }

  ngOnInit() {
  
  }

}
