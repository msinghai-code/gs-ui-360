import { Directive, ViewContainerRef } from "@angular/core";

@Directive({
  selector: '[gsGenericHost]'
})
export class GenericHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}