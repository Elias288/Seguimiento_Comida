import { TestBed } from '@angular/core/testing';

import { CanAccesService } from './can-acces.service';

describe('CanAccesService', () => {
  let service: CanAccesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanAccesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
