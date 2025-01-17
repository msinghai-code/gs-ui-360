import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeWidgetBuilderComponent } from './attribute-widget-builder.component';

describe('AttributeWidgetBuilderComponent', () => {
  let component: AttributeWidgetBuilderComponent;
  let fixture: ComponentFixture<AttributeWidgetBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeWidgetBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeWidgetBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
