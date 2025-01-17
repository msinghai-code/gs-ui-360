import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmWidgetBaseComponent } from './csm-widget-base.component';

describe('CsmWidgetBaseComponent', () => {
  let component: CsmWidgetBaseComponent;
  let fixture: ComponentFixture<CsmWidgetBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmWidgetBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmWidgetBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
