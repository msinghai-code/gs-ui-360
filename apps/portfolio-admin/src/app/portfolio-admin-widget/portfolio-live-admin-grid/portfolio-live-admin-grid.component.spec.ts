import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioLiveAdminGridComponent } from './portfolio-live-admin-grid.component';


describe('WidgetFieldComponent', () => {
  let component: PortfolioLiveAdminGridComponent;
  let fixture: ComponentFixture<PortfolioLiveAdminGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioLiveAdminGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioLiveAdminGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
