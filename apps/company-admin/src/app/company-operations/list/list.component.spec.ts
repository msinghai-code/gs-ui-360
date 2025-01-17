import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ListComponent } from './list.component';
import { ActionsHeaderComponent } from '../actions-header/actions-header.component';
import { GSGridComponent } from 'libs/shared/src/lib/grid/grid.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Observable } from 'rxjs';
import { NzModalService } from '@gs/ng-horizon/modal';
import { RouterTestingModule } from '@angular/router/testing';
import { CompaniesFacade } from '../state/companies.facade';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockComponent, MockedComponent, MockRender } from 'ng-mocks';
import { Store } from '@ngrx/store';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let actions: Observable<any>;
  let store;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListComponent, MockComponent(ActionsHeaderComponent)],
      providers: [
        CompaniesFacade,
        {
          provide: NzModalService,
          useValue: {
            open: of({})
          }
        },
        {
          provide: "env",
          useValue: {}
        },
        provideMockActions(() => actions),
        provideMockStore({
          initialState: {
            companies: {
              list: [],
              loaded: false
            }
          }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [RouterTestingModule]
    }).compileComponents();

    store = TestBed.get(Store);
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should have have the popup html', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.innerHTML).toContain("gs-popover");
  });


  it('should have Action Headers ', () => {
      const compiled = fixture.debugElement.nativeElement;
      component.columnsLoaded = true;
      fixture.detectChanges();
      expect(compiled.innerHTML).toContain("gs-actions-header");
  });

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(ListComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // it('should show spinner', () => {
  //   const componentElement = fixture.debugElement.nativeElement;
  //   expect(componentElement.querySelector('companyListGrid').getAttribute('show')).toBe(true);
  // });
  // });
});
