import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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
      import('./features/user/user-routing-module').then(m => m.UserRoutingModule)
  },
  {
    path: 'admin',
    loadChildren: () => 
      import('./features/admin/admin-routing-module').then(m => m.AdminRoutingModule)
  },
  // Redirection globale pour les URLs inconnues vers la racine (Public)
  { 
    path: '**', 
    redirectTo: '' 
  }
];