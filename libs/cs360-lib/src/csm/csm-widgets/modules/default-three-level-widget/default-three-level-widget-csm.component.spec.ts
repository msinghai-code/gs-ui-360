import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultThreeLevelWidgetCsmComponent } from './default-three-level-widget-csm.component';

describe('DefaultThreeLevelWidgetCsmComponent', () => {
  let component: DefaultThreeLevelWidgetCsmComponent;
  let fixture: ComponentFixture<DefaultThreeLevelWidgetCsmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultThreeLevelWidgetCsmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultThreeLevelWidgetCsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
