import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    Pipe,
    PipeTransform
} from '@angular/core';
import { ISummaryAttributeData} from "../../ISummaryInterface";
import { isUndefined } from "lodash"

export const iconTrendMap = {
    positive: 'arrow-up',
    negative: 'arrow-down',
    neutral: 'minus'
}
@Component({
    selector: 'gs-number-view',
    templateUrl: './number-view.component.html',
    styleUrls: ['./number-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberViewComponent implements OnInit {
    @Input() attributeConfig: ISummaryAttributeData = {};

    @Output() changes : EventEmitter<any> = new EventEmitter<any>(); // add interface and remove any
    iconType: any = 'arrow-down';
    hideNumbers:boolean = false;

    ngOnInit() {
        if(!!((this.attributeConfig.trend || {}).name)){
            this.iconType = iconTrendMap[this.attributeConfig.trend.name.toLowerCase()] || iconTrendMap.positive;
        }
        if(this.attributeConfig.id==='Health_Score' || this.attributeConfig.id==='final_value'){
            this.hideNumbers = true;
        }
    }
}

@Pipe({name: "attributeFinalValue"})
export class AttributeFinalValue implements PipeTransform {
    transform(attributeConfig: ISummaryAttributeData) {
        let finalValue = !!attributeConfig.finalValue ?
            attributeConfig.finalValue :
            (attributeConfig.prefix || '') + ' ' +
            (!isUndefined(attributeConfig.value) ? attributeConfig.value: '') + ' ' +
            (attributeConfig.suffix || '');
        return finalValue;
    }
}
