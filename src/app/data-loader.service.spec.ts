import { TestBed, inject } from '@angular/core/testing';

import { DataLoaderService } from './data-loader.service';

describe('DataLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataLoaderService]
    });
  });

  it('should be created', inject([DataLoaderService], (service: DataLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
