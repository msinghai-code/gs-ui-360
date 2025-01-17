import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmTimelineComponent } from './csm-timeline.component';

describe('CsmTimelineComponent', () => {
  let component: CsmTimelineComponent;
  let fixture: ComponentFixture<CsmTimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmTimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
