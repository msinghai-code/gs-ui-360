import { TestBed } from '@angular/core/testing';

import { QuickActionsService } from './quick-actions.service';

describe('QuickActionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QuickActionsService = TestBed.get(QuickActionsService);
    expect(service).toBeTruthy();
  });
});
