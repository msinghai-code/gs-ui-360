import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertComponent } from './upsert.component';

describe('UpsertComponent', () => {
  let component: UpsertComponent;
  let fixture: ComponentFixture<UpsertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpsertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpsertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
