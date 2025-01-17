import { ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import {GenericHostDirective, ICONTEXT_INFO} from '@gs/cs360-lib/src/common';
import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import { QuickActionContext } from '@gs/cs360-lib/src/common';
import { QuickActionsSectionProviderRegistry } from './quick-actions-registry';
import { SectionRendererService } from '@gs/cs360-lib/src/common';
import { CsmSectionRendererService } from "../csm-sections/csm-section-renderer/csm-section-renderer.service";

@Component({
  selector: 'gs-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss']
})
export class QuickActionsComponent implements OnInit {

  @Input() context: QuickActionContext;
  @Input() ctx: ICONTEXT_INFO;
  isVisible: boolean;
  @ViewChild(GenericHostDirective, { static: false }) hostRef: GenericHostDirective;
  constructor(private cfr: ComponentFactoryResolver,
    protected sectionRendererService: SectionRendererService,
    protected viewContainerRef: ViewContainerRef,
    protected elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private csmSectionRenderService: CsmSectionRendererService) { }

  ngOnInit() {
    // Assigning the csm quick action component class based on context and quick action type
    const quickActionComponentClass =
        this.csmSectionRenderService.getQuickActionComponentClass(this.ctx.pageContext, this.context.type);
    this.loadSection(quickActionComponentClass);
  }

  async loadSection(quickActionComponentClass) {
    let componentClass = null;
    if(quickActionComponentClass){
      componentClass = quickActionComponentClass;
      this.cdr.detectChanges();
    }else{
      const sectionProvider: AbstractSectionProvider = QuickActionsSectionProviderRegistry.getSectionProvider(this.context.type);
      if (!sectionProvider) { console.error(`there is no provider for widget ${this.context}`); return; }
      componentClass = await sectionProvider.getSectionView();
      if (!componentClass) { return; }
    }
    const factory = this.cfr.resolveComponentFactory(componentClass);
    const viewContainerRef = this.hostRef.viewContainerRef;
    viewContainerRef.clear();
    if (this.context.componentRef) {
      this.context.componentRef.destroy();
    }
    this.context.componentRef = viewContainerRef.createComponent(factory);
    const widgetInstance = (this.context.componentRef.instance);
    widgetInstance.context = this.context;
    if(widgetInstance.onAction) {
      widgetInstance.onAction.subscribe(($event) => {
        if($event.type === "CANCEL") {
          this.context.show = false;
          this.cdr.detectChanges();
        } else if($event.type === "SAVE") {
          this.context.show = false;
          this.cdr.detectChanges();
          this.sectionRendererService.setQuickActionCreated(this.context);
        }
      })
    }
    this.context.loading = false;
  }

  ok(): void {
    if (this.context.componentRef && this.context.componentRef.instance) {
      const data = this.context.componentRef.instance.toJSON();
      this.context.data = data;
      this.context.save(this.context);
    }
    this.context.show = false;
  }

  cancel(): void {
    this.context.cancel(this.context.id);
    this.context.show = false;
  }

}
