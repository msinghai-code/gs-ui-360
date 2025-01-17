import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultThreeLevelWidgetBuilderComponent } from './default-three-level-widget-builder.component';

describe('DefaultThreeLevelWidgetBuilderComponent', () => {
  let component: DefaultThreeLevelWidgetBuilderComponent;
  let fixture: ComponentFixture<DefaultThreeLevelWidgetBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultThreeLevelWidgetBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultThreeLevelWidgetBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
