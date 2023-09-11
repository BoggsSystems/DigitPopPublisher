
import { MatToolbarModule } from '@angular/material/toolbar';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.authStatus.subscribe(status => {
      this.isAuthenticated = status;
    });
  }

  logout() {
    this.authService.logout(); // assuming your auth service has a logout method
  }
}
