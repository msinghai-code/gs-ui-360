import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldWidgetSettingComponent } from './field-widget-setting.component';

describe('FieldWidgetSettingComponent', () => {
  let component: FieldWidgetSettingComponent;
  let fixture: ComponentFixture<FieldWidgetSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldWidgetSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldWidgetSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
