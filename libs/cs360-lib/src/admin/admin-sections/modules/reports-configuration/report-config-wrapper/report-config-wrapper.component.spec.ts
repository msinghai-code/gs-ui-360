import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportConfigWrapperComponent } from './report-config-wrapper.component';

describe('ReportConfigWrapperComponent', () => {
  let component: ReportConfigWrapperComponent;
  let fixture: ComponentFixture<ReportConfigWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportConfigWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportConfigWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
