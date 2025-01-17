import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmCockpitComponent } from './csm-cockpit.component';

describe('CsmCockpitComponent', () => {
  let component: CsmCockpitComponent;
  let fixture: ComponentFixture<CsmCockpitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmCockpitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmCockpitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
