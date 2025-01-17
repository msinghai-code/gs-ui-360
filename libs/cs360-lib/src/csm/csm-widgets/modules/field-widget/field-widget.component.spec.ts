import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldWidgetComponent } from './field-widget.component';

describe('FieldWidgetComponent', () => {
  let component: FieldWidgetComponent;
  let fixture: ComponentFixture<FieldWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
