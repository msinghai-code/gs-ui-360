import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridColumnChooserComponent } from './grid-column-chooser.component';

describe('GridColumnChooserComponent', () => {
  let component: GridColumnChooserComponent;
  let fixture: ComponentFixture<GridColumnChooserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridColumnChooserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridColumnChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
