import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentGeneration } from './document-generation';

describe('DocumentGeneration', () => {
  let component: DocumentGeneration;
  let fixture: ComponentFixture<DocumentGeneration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentGeneration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentGeneration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
