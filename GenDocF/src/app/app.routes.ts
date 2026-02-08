import { Routes } from '@angular/router';

export const routes: Routes = [
  // 1. D'abord les routes spécifiques (Auth, User, Admin)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-routing-module').then(m => m.AuthRoutingModule)
  },
  {
    path: 'user', // Espace connecté
    loadChildren: () => import('./features/user/user-routing-module').then(m => m.UserRoutingModule)
  },
  {
    path: 'admin', // Espace admin
    loadChildren: () => import('./features/admin/admin-routing-module').then(m => m.AdminRoutingModule)
  },

  // 2. ENFIN, la route par défaut (Le Site Public)
  // On charge le module Public pour la racine '' (l'accueil) et tout ce qui suit (/about, /contact...)
  {
    path: '',
    loadChildren: () => import('./features/public/public-routing-module').then(m => m.PublicRoutingModule)
  },

  // 3. Sécurité (Wildcard) : Si vraiment aucune route ne matche, retour à l'accueil
  {
    path: '**',
    redirectTo: ''
  }
];