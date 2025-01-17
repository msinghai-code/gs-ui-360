import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CockpitDefaultSettingComponent } from './cockpit-default-setting.component';

describe('CockpitDefaultSettingComponent', () => {
  let component: CockpitDefaultSettingComponent;
  let fixture: ComponentFixture<CockpitDefaultSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CockpitDefaultSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CockpitDefaultSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
