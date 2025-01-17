import { TestBed } from '@angular/core/testing';

import { SectionListingService } from './section-listing.service';

describe('SectionListingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SectionListingService = TestBed.get(SectionListingService);
    expect(service).toBeTruthy();
  });
});
