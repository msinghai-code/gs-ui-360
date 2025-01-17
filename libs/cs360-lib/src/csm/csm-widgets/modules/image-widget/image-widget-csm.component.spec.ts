import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageWidgetCsmComponent } from './image-widget-csm.component';

describe('ImageWidgetCsmComponent', () => {
  let component: ImageWidgetCsmComponent;
  let fixture: ComponentFixture<ImageWidgetCsmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageWidgetCsmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageWidgetCsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
