import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEditIPRangeComponent } from './add-edit-iprange.component';


describe('AddEditIPRangeComponent', () => {
  let component: AddEditIPRangeComponent;
  let fixture: ComponentFixture<AddEditIPRangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditIPRangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditIPRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
