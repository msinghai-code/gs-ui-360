
import { Directive,HostListener,ElementRef,Input,Output,EventEmitter, NgModule } from '@angular/core';

@Directive({
  selector: '[gsShowIfEllipsis]'
})
export class ShowIfEllipsisDirective {

  @Input() elementType : string = 'block';'URL';
  @Output() isEllipsisVisible:EventEmitter<any> = new EventEmitter();
  constructor(
    private elementRef: ElementRef<HTMLElement>) { }

  @HostListener('mouseenter')
  setEllipsisState() {
    let isShowToolTip;
      const element = this.elementRef.nativeElement;
      isShowToolTip = element.clientHeight < element.scrollHeight || element.clientWidth < element.scrollWidth;
      if(this.elementType =='URL')
       isShowToolTip =  element.clientWidth < element.scrollWidth;

      this.isEllipsisVisible.emit(isShowToolTip)
  }

}

@NgModule({
  declarations: [ShowIfEllipsisDirective],
  exports: [ShowIfEllipsisDirective],
})
export class ShowIfEllipsisModule {}