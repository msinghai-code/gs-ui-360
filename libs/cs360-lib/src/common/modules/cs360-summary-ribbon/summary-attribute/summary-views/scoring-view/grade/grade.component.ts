import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {isEmpty, orderBy} from 'lodash';
import { reduce } from 'lodash';

@Component({
  selector: 'gs-grade-score',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradeComponent implements OnInit {
  @Input() data: Array<{
    label:string;
    value:string | number;
    color: string;
    width: string;
    tooltip: string;
  }>;

  constructor() { }

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
