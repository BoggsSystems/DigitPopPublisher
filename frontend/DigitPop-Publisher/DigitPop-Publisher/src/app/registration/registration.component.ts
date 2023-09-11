import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublisherService } from '../publisher.service';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  @ViewChild('stepper', { static: true }) stepper!: MatStepper;
  isLinear = true;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  registrationComplete = false;

  constructor(
    private _formBuilder: FormBuilder,
    private publisherService: PublisherService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.firstFormGroup = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      companyName: ['', Validators.required],
      companyURL: ['', Validators.required],
      companyEmail: ['', Validators.required],
      companyPhone: ['', Validators.required],
    });

    this.secondFormGroup = this._formBuilder.group({
      primaryContactName: ['', Validators.required],
      primaryContactEmail: ['', Validators.required],
      primaryContactPhone: ['', Validators.required],
      primaryContactPosition: ['', Validators.required],
    });

    this.thirdFormGroup = this._formBuilder.group({
      secondaryContactName: ['', Validators.required],
      secondaryContactEmail: ['', Validators.required],
      secondaryContactPhone: ['', Validators.required],
      secondaryContactPosition: ['', Validators.required],
    });

    this.fourthFormGroup = this._formBuilder.group({
      websiteURL: ['', Validators.required],
      monthlyActiveUsers: ['', Validators.required],
      monthlyPageViews: ['', Validators.required],
      primaryContentFocus: ['', Validators.required],
      primaryAudienceGeos: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });

    this.secondFormGroup = this._formBuilder.group({
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      companyWebsite: ['', Validators.required],
      companyType: ['', Validators.required],
    });

    this.thirdFormGroup = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  get f1() {
    return this.firstFormGroup.controls;
  }
  get f2() {
    return this.secondFormGroup.controls;
  }
  get f3() {
    return this.thirdFormGroup.controls;
  }

  register() {
    if (
      this.firstFormGroup.valid &&
      this.secondFormGroup.valid &&
      this.thirdFormGroup.valid
    ) {
      const registrationData = {
        personalInfo: this.firstFormGroup.value,
        companyInfo: this.secondFormGroup.value,
        accountDetails: this.thirdFormGroup.value,
      };

      this.publisherService.register(registrationData).subscribe(
        (response) => {
          console.log(response);
          // After successful registration
          this.registrationComplete = true;
          // Navigate to the final step
          this.stepper.selectedIndex = this.stepper._steps.length - 1;

          this.showNotification('Registration submitted successfully!', true);

          // Navigate to the home component after successful registration
          this.router.navigateByUrl('/');
        },
        (error) => {
          console.log(error);
          // Show error notification
          this.showNotification(
            'Registration failed. Please try again.',
            false
          );
        }
      );
    }
  }

  showNotification(message: string, isSuccess: boolean = true) {
    if (isSuccess) {
      this.toastr.success(message); // Display success toast
    } else {
      this.toastr.error(message); // Display error toast
    }
  }

  resetForm() {
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
    this.thirdFormGroup.reset();
  }
}
