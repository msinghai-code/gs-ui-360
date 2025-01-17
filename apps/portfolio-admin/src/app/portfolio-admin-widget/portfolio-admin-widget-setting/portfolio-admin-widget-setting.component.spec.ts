import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioAdminWidgetFacade } from '../state/portfolio-admin-widget.facade';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PortfolioAdminWidgetSettingComponent } from './portfolio-admin-widget-setting.component';
import { CommonModule } from '@angular/common';

describe('PortfolioAdminWidgetSettingComponent', () => {
  let component: PortfolioAdminWidgetSettingComponent;
  let fixture: ComponentFixture<PortfolioAdminWidgetSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [PortfolioAdminWidgetSettingComponent],
      providers: [{
        provide: PortfolioAdminWidgetFacade,
        useValue: {
          showToastMessage: () => { }
        }
      }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioAdminWidgetSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
