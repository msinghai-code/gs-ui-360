import { TestBed } from '@angular/core/testing';

import { CsmSummaryService } from './csm-summary.service';

describe('CsmSummaryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CsmSummaryService = TestBed.get(CsmSummaryService);
    expect(service).toBeTruthy();
  });
});
