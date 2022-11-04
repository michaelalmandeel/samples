import { TestBed } from '@angular/core/testing';

import { MenuDataSourceService } from './menu-data-source.service';

describe('MenuDataSourceService', () => {
  let service: MenuDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
