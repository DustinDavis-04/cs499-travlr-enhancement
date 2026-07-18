import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthenticationService } from '../services/authentication';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  // Allow authenticated users to access protected pages.
  if (authenticationService.isLoggedIn()) {
    return true;
  }

  // Redirect unauthenticated users to the login page.
  return router.createUrlTree(['/login'], {
    queryParams: { reason: 'auth-required' }
  });
}
