import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultWidgetSettingComponent } from './default-widget-setting.component';

describe('DefaultWidgetSettingComponent', () => {
  let component: DefaultWidgetSettingComponent;
  let fixture: ComponentFixture<DefaultWidgetSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultWidgetSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultWidgetSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
