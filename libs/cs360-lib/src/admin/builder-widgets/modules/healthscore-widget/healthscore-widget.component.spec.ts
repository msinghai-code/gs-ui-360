import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthscoreWidgetComponent } from './healthscore-widget.component';

describe('HealthscoreWidgetComponent', () => {
  let component: HealthscoreWidgetComponent;
  let fixture: ComponentFixture<HealthscoreWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthscoreWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthscoreWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
