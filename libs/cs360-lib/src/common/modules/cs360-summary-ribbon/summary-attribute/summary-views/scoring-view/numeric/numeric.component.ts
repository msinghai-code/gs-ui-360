import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import { reduce } from 'lodash';
import {CONTEXT_INFO, ICONTEXT_INFO} from "../../../../../../context.token";
@Component({
  selector: 'gs-numeric-score',
  templateUrl: './numeric.component.html',
  styleUrls: ['./numeric.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumericComponent implements OnInit {
  @Input() data: Array<{
    label:string;
    value:string | number;
    color: string;
    width: string;
    tooltip: string;
  }>;

  isMini = false;

  constructor(
      @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
  ){}

  ngOnInit() {
    this.isMini = this.ctx.appVariant==='MINI_360';
    const measuresTotalValue = reduce(this.data, (sum, measure) => (sum + measure.value), 0);
    if(this.data && this.data.length > 0){
      this.data.forEach( element => (element.width = ( (element.value as number * 100) / measuresTotalValue) + "%" ))
    }
  }
}
