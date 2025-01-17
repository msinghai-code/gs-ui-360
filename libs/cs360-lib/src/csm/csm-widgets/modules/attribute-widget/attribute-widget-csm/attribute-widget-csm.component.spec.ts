import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeWidgetCsmComponent } from './attribute-widget-csm.component';

describe('AttributeWidgetCsmComponent', () => {
  let component: AttributeWidgetCsmComponent;
  let fixture: ComponentFixture<AttributeWidgetCsmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeWidgetCsmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeWidgetCsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
