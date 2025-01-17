// Angular & rxjs imports
import { Inject, Injectable } from '@angular/core';
import { OverlayContainer } from "@angular/cdk/overlay";
import { DOCUMENT } from "@angular/common";

// @gs/gdk imports
import { OVERLAY_NAME_TOKEN } from '@gs/gdk/core';

@Injectable({
  providedIn:"root"
})
export class CompanyRulesOverlayProvider extends OverlayContainer{

  constructor(
    @Inject(DOCUMENT) document: any,
    @Inject(OVERLAY_NAME_TOKEN) private readonly overlaySelector: string) {
    super(document);
  }

  getRootElement() {
    let rootEle = this._document.querySelector(this.overlaySelector);
    if(!rootEle){
      rootEle = this._document.createElement(this.overlaySelector);
      this._document.body.appendChild(rootEle);
    }
    return rootEle;
  }

  protected _createContainer(): void {
    const containerClass = 'cdk-overlay-container';
    const previousContainers = this._document.querySelectorAll(`${OVERLAY_NAME_TOKEN} .${containerClass}`);
    // Remove any old containers. This can happen when transitioning from the server to the client.
    previousContainers.forEach(el => {
      el.parentNode.removeChild(el);
    });
    const container = this._document.createElement('div');
    container.classList.add(containerClass);
    /** Below additional class is added as horizon overlays are styles based on parent class people-section-app */
    container.classList.add('company-rules-actions-app');
    this._containerElement = container;
    this.appendToRootComponent();
  }

  private appendToRootComponent(): void {
    if (!this._containerElement) {
      return;
    }

    const rootElement = this.getRootElement();
    if(rootElement && rootElement.shadowRoot){
      rootElement.shadowRoot.appendChild(this._containerElement);
    } else {
      rootElement.appendChild(this._containerElement);
      customElements.whenDefined(this.overlaySelector).then(()=>{
        rootElement.shadowRoot.appendChild(this._containerElement);
      })
    }

  }
}
