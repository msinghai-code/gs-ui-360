import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmLeadsComponent } from './csm-leads.component';

describe('CsmLeadsComponent', () => {
  let component: CsmLeadsComponent;
  let fixture: ComponentFixture<CsmLeadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmLeadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
