import { Routes } from '@angular/router';
import { authMatchGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'public',
    pathMatch: 'full'
  },

  // --- TES MODULES (LAZY LOADING) ---
  
  {
    // Si tu as une partie publique (Site vitrine), on peut y accéder via /public
    path: 'public', 
    loadChildren: () => 
      import('./features/public/public-routing-module').then(m => m.PublicRoutingModule)
  },
  {
    path: 'auth',
    loadChildren: () => 
      import('./features/auth/auth-routing-module').then(m => m.AuthRoutingModule)
  },
  {
    path: 'user',
    loadChildren: () => 
      import('./features/user/user-routing-module').then(m => m.UserRoutingModule),
    canMatch: [authMatchGuard]
  },
  {
    path: 'admin',
    loadChildren: () => 
      import('./features/admin/admin-routing-module').then(m => m.AdminRoutingModule)
  },

  // --- GESTION DES ERREURS (404) ---
  
  // Si l'URL n'existe pas, on renvoie vers le login
  { 
    path: '**', 
    redirectTo: 'public' 
  }
];