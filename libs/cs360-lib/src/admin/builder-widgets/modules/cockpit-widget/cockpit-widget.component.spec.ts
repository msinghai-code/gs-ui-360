import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CockpitWidgetComponent } from './cockpit-widget.component';

describe('CockpitWidgetComponent', () => {
  let component: CockpitWidgetComponent;
  let fixture: ComponentFixture<CockpitWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CockpitWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CockpitWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
