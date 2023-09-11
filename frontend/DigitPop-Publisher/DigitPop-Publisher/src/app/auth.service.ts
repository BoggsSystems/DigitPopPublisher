import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authStatus = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    // Checking if user is already authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      this._authStatus.next(true);
    }
  }

  get authStatus() {
    return this._authStatus.asObservable();
  }

  // Provide a way to get the stored publisher ID
  get publisherId() {
    return localStorage.getItem('publisher_id');
  }

  signIn(email: string, password: string) {
    console.log("Password is : " + password);
    return this.http.post<{ token: string, publisherId: string }>('https://digitpop-publisher.azurewebsites.net/api/signInPublisher?code=kCDbrwGjdxdxQ5pprjZI10eAQdYOj4IuI6t45eAO7M83AzFuoRTq7A==', { email, password }).pipe(
      tap(response => {
        localStorage.setItem('auth_token', response.token);
        // Store publisherId in local storage
        localStorage.setItem('publisher_id', response.publisherId);
        this._authStatus.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('publisher_id');  // Remove publisherId from local storage
    this._authStatus.next(false);
    this.router.navigateByUrl('/signin');
  }
}
