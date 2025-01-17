import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthscoreWidgetSettingsComponent } from './healthscore-widget-settings.component';

describe('HealthscoreWidgetSettingsComponent', () => {
  let component: HealthscoreWidgetSettingsComponent;
  let fixture: ComponentFixture<HealthscoreWidgetSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthscoreWidgetSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthscoreWidgetSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
