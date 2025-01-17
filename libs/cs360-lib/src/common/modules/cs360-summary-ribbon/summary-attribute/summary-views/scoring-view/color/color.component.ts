import {Component, Input, OnInit} from '@angular/core';
import {isEmpty, orderBy} from 'lodash';
import { reduce } from 'lodash';

@Component({
  selector: 'gs-color-score',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss']
})
export class ColorComponent implements OnInit {

  @Input() data: Array<{
    label:string;
    value:string | number;
    color: string;
    width: string;
    tooltip: string;
  }>;

  constructor() {}

  ngOnInit() {
    const measuresTotalValue = reduce(this.data, (sum, measure) => (sum + measure.value), 0);
    this.data.forEach( element => (element.width = ( (element.value as number * 100) / measuresTotalValue) + "%" ));
  }

  public helpTextProcessing(data){
    if(isEmpty(data)){
      return;
    }
    return data.replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/(&#39;)|(&apos;)/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

}
