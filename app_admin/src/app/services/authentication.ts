import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripDataService } from './trip-data';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private tripDataService: TripDataService) { }

  public getToken(): string {
    return StorageService.getToken() ?? '';
  }

  public saveToken(token: string): void {
    StorageService.saveToken(token);
  }

  public logout(): void {
    StorageService.removeToken();
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {
      // Reject expired tokens before protected routes are loaded.
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      // Remove damaged tokens so they are not reused later.
      this.logout();
      return false;
    }
  }

  public getCurrentUser(): User | null {
    const token = this.getToken();

    if (!token || !this.isLoggedIn()) {
      return null;
    }

    try {
      const { email, name } = JSON.parse(atob(token.split('.')[1]));
      return { email, name } as User;
    } catch {
      // Clear invalid session data before returning no user.
      this.logout();
      return null;
    }
  }

  public login(user: User, password: string): Observable<AuthResponse> {
    // Return the request so the component can handle success and errors.
    return this.tripDataService.login(user, password).pipe(
      tap((response: AuthResponse) => {
        // Save the token only after the API confirms the login.
        this.saveToken(response.token);
      })
    );
  }

  public register(user: User, password: string): Observable<AuthResponse> {
    // Registration uses the same token storage process as login.
    return this.tripDataService.register(user, password).pipe(
      tap((response: AuthResponse) => {
        this.saveToken(response.token);
      })
    );
  }
}
