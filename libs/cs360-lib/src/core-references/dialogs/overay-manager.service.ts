import {mapTo, takeUntil} from 'rxjs/operators';
import {ElementRef, Injectable, ViewContainerRef} from "@angular/core";

import {Overlay, OverlayRef} from "@angular/cdk/overlay";
import {TemplatePortal} from "@angular/cdk/portal";

import {Observable} from "rxjs";

@Injectable()
export class OverlayManagerService {

  opened = false;

  private _closeOnClick = true;
  private _toggle = true;
  private _overlayRef: OverlayRef;
  constructor(private _ol: Overlay) { }

  /* THIS IS SOME LOWLEVEL FUNCTIONALITY, will be used ONLY WHEN PERFORMANCE IS IMPORTANT */
  open(tmpl, vcr: ViewContainerRef, elRef: ElementRef | HTMLElement, hasBackdrop = false): Observable<any> {

    if (this.open) {
      this.close();
    }

    let positionStrategy;
    const portal = new TemplatePortal(tmpl, vcr);

    if (elRef instanceof ElementRef) {
      positionStrategy = this._ol
        .position()
        .connectedTo(elRef,
        { originX: "center", originY: "bottom" },
        { overlayX: "center", overlayY: "top" })
        .withFallbackPosition(
        { originX: "center", originY: "top" },
        { overlayX: "center", overlayY: "bottom" });
    } else {
      positionStrategy =  this._ol
        .position()
        .global()
        .left((elRef as HTMLElement).getBoundingClientRect().left + "px")
        .top((elRef as HTMLElement).getBoundingClientRect().bottom + "px");
    }

    const scrollStrategy = this._ol.scrollStrategies.block();

    this._overlayRef = this._ol.create({
      hasBackdrop,
      positionStrategy,
      scrollStrategy
    });

    this._overlayRef.attach(portal);
    this.opened = true;

    return this._overlayRef
        .backdropClick().pipe(
        takeUntil(this._overlayRef.detachments()),
        mapTo("CLOSE"));
  }

  close() {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
    this.opened = false;
  }

}
