import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmSummaryComponent } from './csm-summary.component';

describe('CsmSummaryComponent', () => {
  let component: CsmSummaryComponent;
  let fixture: ComponentFixture<CsmSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
