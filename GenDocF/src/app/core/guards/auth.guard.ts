import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
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