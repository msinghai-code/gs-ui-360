import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[gsDocumentEvent]',
})
export class DocumentEventDirective {
  @Output() gsDocumentEvent = new EventEmitter();

  constructor() {

  }

  @HostListener('document:click', ['$event'])
  public onClick(event) {
    if (!event) {
      return;
    }
    this.gsDocumentEvent.emit({ event: 'CLICKED', nativeEvent: event });
  }

  @HostListener('document:keydown.escape', ['$event'])
  public onEscapePress(event) {
    if (!event) {
      return;
    }
    this.gsDocumentEvent.emit({ event: 'ESCAPE_PRESSED', nativeEvent: event });
  }

  @HostListener('document:keydown.enter', ['$event'])
  public onEnterPress(event) {
    if (!event) {
      return;
    }
    this.gsDocumentEvent.emit({ event: 'ENTER_PRESSED', nativeEvent: event });
  }

  @HostListener('document:keydown.tab', ['$event'])
  public onTabPress(event) {
    if (!event) {
      return;
    }
    this.gsDocumentEvent.emit({ event: 'TAB_PRESSED', nativeEvent: event });
  }
}


@Directive({
  selector: '[autofocus]'
})
export class AutofocusDirective {
  constructor(private host: ElementRef) { }

  ngAfterViewInit() {
    this.host.nativeElement.focus();
  }
}