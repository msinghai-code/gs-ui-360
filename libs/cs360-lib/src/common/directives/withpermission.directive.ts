import { Directive, ElementRef, Inject, OnInit } from '@angular/core';
import {EnvironmentService} from "@gs/gdk/services/environment";

@Directive({
  selector: '[gsWithpermission]'
})
export class WithpermissionDirective implements OnInit {

  constructor(private elementRef: ElementRef,@Inject("envService") private _env: EnvironmentService) {
  }
  ngOnInit() {
    if(this.elementRef && this.elementRef.nativeElement) {
      this.elementRef.nativeElement.hidden = this._env.gsObject.isReadOnlyApp;
    }
  }

}

