import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmRcForecastComponent } from './csm-rc-forecast.component';

describe('CsmRcForecastComponent', () => {
  let component: CsmRcForecastComponent;
  let fixture: ComponentFixture<CsmRcForecastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmRcForecastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmRcForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
