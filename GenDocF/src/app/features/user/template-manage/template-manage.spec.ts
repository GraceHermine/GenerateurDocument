import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateManage } from './template-manage';

describe('TemplateManage', () => {
  let component: TemplateManage;
  let fixture: ComponentFixture<TemplateManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateManage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
