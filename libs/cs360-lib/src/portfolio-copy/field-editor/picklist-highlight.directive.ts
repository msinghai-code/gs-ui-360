import { Directive, Input, ElementRef, OnInit, OnChanges } from '@angular/core';
import { WidgetField } from '../pojos/portfolio-interfaces';

@Directive({
  selector: '[gsPicklistHighlight]',
})
export class PicklistHighlightDirective implements OnInit{
  @Input() fieldInfo: WidgetField;
  @Input() value: any;
  @Input('gsPicklistHighlight') gsPicklistHighlight = true;
  constructor(private elementRef:ElementRef) { }

  ngOnInit(){
    this.setBackgroundColor();
  }

  setBackgroundColor(){
    const {options, value} = this.fieldInfo;
    let bgColor = "transparent";
    let borderColor = "rgba(15, 135, 236, 0.08)";
    if(value && typeof value === 'string' && options) {
      const selectedOption = options.find(opt => opt.label === value);
      bgColor = selectedOption ? selectedOption.color : bgColor;
      borderColor = selectedOption ? selectedOption.color : borderColor;
    }
    this.elementRef.nativeElement.style.backgroundColor = bgColor + "50";
    this.elementRef.nativeElement.style.borderColor = borderColor;
  }
}
