import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageWidgetSettingsComponent } from './image-widget-settings.component';

describe('ImageWidgetSettingsComponent', () => {
  let component: ImageWidgetSettingsComponent;
  let fixture: ComponentFixture<ImageWidgetSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageWidgetSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageWidgetSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
