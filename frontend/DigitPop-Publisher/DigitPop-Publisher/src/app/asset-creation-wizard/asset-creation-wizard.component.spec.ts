import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCreationWizardComponent } from './asset-creation-wizard.component';

describe('AssetCreationWizardComponent', () => {
  let component: AssetCreationWizardComponent;
  let fixture: ComponentFixture<AssetCreationWizardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetCreationWizardComponent]
    });
    fixture = TestBed.createComponent(AssetCreationWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
