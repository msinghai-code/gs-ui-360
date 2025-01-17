import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmScorecardComponent } from './csm-scorecard.component';

describe('CsmScorecardComponent', () => {
  let component: CsmScorecardComponent;
  let fixture: ComponentFixture<CsmScorecardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmScorecardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmScorecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
