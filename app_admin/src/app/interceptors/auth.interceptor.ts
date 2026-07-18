import { HttpInterceptorFn } from '@angular/common/http';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = StorageService.getToken();

  const isAuthApi =
    req.url.includes('/api/login') || req.url.includes('/api/register');

  if (token && !isAuthApi) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  return next(req);
};