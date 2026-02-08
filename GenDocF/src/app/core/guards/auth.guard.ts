import { inject } from '@angular/core';
<<<<<<< HEAD
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
=======
import { Router, CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // L'utilisateur est connecté, on laisse passer
  } else {
    // Pas connecté ? On redirige vers la page de connexion
    router.navigate(['/auth/login']);
    return false;
  }
};

export const authMatchGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
>>>>>>> fix-frontend-startup
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

<<<<<<< HEAD
  // Redirect to login if not authenticated
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
=======
  return router.parseUrl('/auth/login');
};
>>>>>>> fix-frontend-startup
