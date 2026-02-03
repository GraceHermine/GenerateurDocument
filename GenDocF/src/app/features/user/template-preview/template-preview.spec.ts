import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatePreview } from './template-preview';

describe('TemplatePreview', () => {
  let component: TemplatePreview;
  let fixture: ComponentFixture<TemplatePreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplatePreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplatePreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
