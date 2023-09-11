import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { SpinnerService } from './spinner.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'DigitPop-Publisher';
  // app.component.ts
  constructor(public spinnerService: SpinnerService) {}
}
