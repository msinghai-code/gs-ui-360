
import { Directive,ElementRef,AfterViewChecked, NgModule } from '@angular/core';

@Directive({
  selector: '[appExternalLink]'
})
export class ExternalLinkDirective implements AfterViewChecked {
  constructor(private el: ElementRef) { }
  ngAfterViewChecked() {
    Array.from(this.el.nativeElement.querySelectorAll('a'))
      .forEach((el: any) => {
        el.setAttribute('target', '_blank');
      });
  }
}

@NgModule({
  declarations: [ExternalLinkDirective],
  exports: [ExternalLinkDirective]
})
export class ExternalLinkModule { }