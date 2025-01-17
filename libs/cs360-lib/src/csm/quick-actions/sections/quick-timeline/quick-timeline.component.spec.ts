import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickTimelineComponent } from './quick-timeline.component';

describe('QuickTimelineComponent', () => {
  let component: QuickTimelineComponent;
  let fixture: ComponentFixture<QuickTimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickTimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
