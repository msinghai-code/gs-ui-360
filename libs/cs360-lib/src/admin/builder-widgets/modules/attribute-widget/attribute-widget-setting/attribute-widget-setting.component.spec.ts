import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeWidgetSettingComponent } from './attribute-widget-setting.component';

describe('AttributeWidgetSettingComponent', () => {
  let component: AttributeWidgetSettingComponent;
  let fixture: ComponentFixture<AttributeWidgetSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeWidgetSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeWidgetSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
