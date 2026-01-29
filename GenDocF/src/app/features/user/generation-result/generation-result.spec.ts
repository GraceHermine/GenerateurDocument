import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationResult } from './generation-result';

describe('GenerationResult', () => {
  let component: GenerationResult;
  let fixture: ComponentFixture<GenerationResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerationResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerationResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
