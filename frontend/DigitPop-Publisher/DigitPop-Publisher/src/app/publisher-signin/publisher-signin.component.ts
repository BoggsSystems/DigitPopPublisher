import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { PublisherService } from '../publisher.service';

@Component({
  selector: 'app-publisher-signin',
  templateUrl: './publisher-signin.component.html',
})
export class PublisherSigninComponent {
  constructor(private authService: AuthService, private publisherService: PublisherService) {}

  signIn(email: string, password: string) {
    this.authService.signIn(email, password).subscribe(() => {
      // Redirect the publisher to the dashboard
      window.location.href = '/dashboard'; // Replace '/dashboard' with the actual route to your dashboard
    }, error => {
      // Here you can handle any errors that occurred while signing in
      console.error('An error occurred:', error);
      // Display the error message
      document.getElementById('errorMessageElement')!.innerText = 'An error occurred: ' + error.message;
    });
  }
}

