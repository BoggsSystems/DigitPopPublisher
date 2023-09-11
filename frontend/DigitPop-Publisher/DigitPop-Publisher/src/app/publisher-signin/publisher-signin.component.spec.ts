import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherSigninComponent } from './publisher-signin.component';

describe('PublisherSigninComponent', () => {
  let component: PublisherSigninComponent;
  let fixture: ComponentFixture<PublisherSigninComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PublisherSigninComponent]
    });
    fixture = TestBed.createComponent(PublisherSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
