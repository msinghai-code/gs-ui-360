import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldTreeViewWrapperComponent } from './field-tree-view-wrapper.component';

describe('FieldTreeViewWrapperComponent', () => {
  let component: FieldTreeViewWrapperComponent;
  let fixture: ComponentFixture<FieldTreeViewWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldTreeViewWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldTreeViewWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
