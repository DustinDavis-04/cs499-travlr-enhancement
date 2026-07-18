import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripDataService } from './trip-data';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  authResp: AuthResponse = new AuthResponse();

  constructor(private tripDataService: TripDataService) {}

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
    const token: string = this.getToken();

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > (Date.now() / 1000);
    }

    return false;
  }

  public getCurrentUser(): User {
    const token: string = this.getToken();
    const { email, name } = JSON.parse(atob(token.split('.')[1]));
    return { email, name } as User;
  }

  public login(user: User, passwd: string): void {
    this.tripDataService.login(user, passwd).subscribe({
      next: (value: AuthResponse) => {
        if (value) {
          this.authResp = value;
          this.saveToken(this.authResp.token);
        }
      },
      error: (error: any) => {
        console.log('Error: ' + error);
      }
    });
  }

  public register(user: User, passwd: string): void {
    this.tripDataService.register(user, passwd).subscribe({
      next: (value: AuthResponse) => {
        if (value) {
          this.authResp = value;
          this.saveToken(this.authResp.token);
        }
      },
      error: (error: any) => {
        console.log('Error: ' + error);
      }
    });
  }
}