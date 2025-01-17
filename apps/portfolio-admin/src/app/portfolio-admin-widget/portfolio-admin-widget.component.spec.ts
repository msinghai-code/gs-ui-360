import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioAdminWidgetComponent } from './portfolio-admin-widget.component';
import { PortfolioAdminWidgetFacade } from './state/portfolio-admin-widget.facade';
import { Subject } from 'rxjs';
import { MockComponent } from 'src/helpers/MockComponent';

describe('PortfolioAdminWidgetComponent', () => {
  let component: PortfolioAdminWidgetComponent;
  let fixture: ComponentFixture<PortfolioAdminWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PortfolioAdminWidgetComponent,
        MockComponent({ selector: "gs-portfolio-widget-setting" }),
        MockComponent({ selector: "gs-portfolio-grid", inputs : ["objectName"] })
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{
        provide: PortfolioAdminWidgetFacade,
        useValue: {
          getCompanyFields$: new Subject<void>(),
          getRelationshipFields$: new Subject<void>(),
          describeObject: () => { }
        }
      }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioAdminWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should have two mat-tabs, Company & Relationship', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll("mat-tab").length).toBe(2);
  });

  it('should have psidebar', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("p-sidebar")).toBeTruthy();
  });

  it('should show the gs-portfolio-widget-setting when openPortfolioSetting is set', () => {
    const compiled = fixture.debugElement.nativeElement;
    component.openPortfolioSetting = true;
    fixture.detectChanges();
    expect(compiled.querySelector("gs-portfolio-widget-setting")).toBeTruthy();
  });

  // it('should show two grids when config is set for both', () => {
  //   const compiled = fixture.debugElement.nativeElement;
  //   component.toSaveConfig = {
  //     showTabs: {
  //       company: true,
  //       relationship: true
  //     }
  //   };
  //   fixture.detectChanges();

  //   console.log(compiled.innerHTML);
  //   expect(compiled.querySelectorAll("gs-portfolio-grid").length).toBe(2);

  // });

  // it('should render only company grid', () => {
  //   const compiled = fixture.debugElement.nativeElement;
  //   component.openPortfolioSetting = true;
  //   component.toSaveConfig = {
  //     showTabs: {
  //       company: true,
  //       relationship: false
  //     }
  //   };
  //   fixture.detectChanges();
  //   expect(compiled.querySelectorAll("gs-portfolio-grid").length).toBe(1);

  //   component.openPortfolioSetting = true;
  //   component.toSaveConfig = {
  //     showTabs: {
  //       company: false,
  //       relationship: true
  //     }
  //   };
  //   fixture.detectChanges();
  //   expect(compiled.querySelectorAll("gs-portfolio-grid").length).toBe(1);
  // });


  


});
