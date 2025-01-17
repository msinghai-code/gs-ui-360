import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmUsageComponent } from './csm-usage.component';

describe('CsmUsageComponent', () => {
  let component: CsmUsageComponent;
  let fixture: ComponentFixture<CsmUsageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmUsageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
