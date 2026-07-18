import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication';
import { User } from '../models/user';

interface LoginCredentials {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  public formError = '';
  public message = '';
  public isSubmitting = false;

  public credentials: LoginCredentials = {
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService
  ) {
    // Explain why the user was redirected to the login page.
    if (this.route.snapshot.queryParamMap.get('reason') === 'auth-required') {
      this.message = 'You must be logged in to add or edit trips.';
    }
  }

  public onLoginSubmit(): void {
    this.formError = '';

    const email = this.credentials.email.trim();

    if (!email || !this.credentials.password) {
      this.formError = 'Email and password are required.';
      return;
    }

    this.doLogin(email);
  }

  private doLogin(email: string): void {
    const user = {
      email,
      name: ''
    } as User;

    this.isSubmitting = true;

    // Wait for the API response before changing pages or showing an error.
    this.authenticationService
      .login(user, this.credentials.password)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['']);
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          this.handleLoginError(error);
        }
      });
  }

  private handleLoginError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.formError = 'The email or password is incorrect.';
      return;
    }

    // Use a general message when the server cannot complete the request.
    this.formError = 'Login could not be completed. Please try again.';
  }
}
