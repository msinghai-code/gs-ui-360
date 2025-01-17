import { Component, OnInit } from '@angular/core';
import { SummaryWidget } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-healthscore-widget',
  templateUrl: './healthscore-widget.component.html',
  styleUrls: ['./healthscore-widget.component.scss']
})
export class HealthscoreWidgetComponent implements OnInit {
  widgetItem: SummaryWidget;
  constructor() { }

  ngOnInit() {
  }

}
