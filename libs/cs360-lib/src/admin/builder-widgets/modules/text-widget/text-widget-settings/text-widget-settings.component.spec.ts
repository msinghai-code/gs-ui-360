import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextWidgetSettingsComponent } from './text-widget-settings.component';

describe('TextWidgetSettingsComponent', () => {
  let component: TextWidgetSettingsComponent;
  let fixture: ComponentFixture<TextWidgetSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextWidgetSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextWidgetSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
