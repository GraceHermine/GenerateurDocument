// app.routes.ts
import { Routes } from '@angular/router';
import { authMatchGuard } from './core/guards/auth.guard';

// Importez TOUS les composants nécessaires
import { Home } from '../../src/app/features/public/home/home';
import { About } from './features/public/about/about';
import { Contact } from './features/public/contact/contact';
import { Faq } from './features/public/faq/faq';
import { Guide } from './features/public/guide/guide';
import { Help } from './features/public/help/help';

import { Dashboard } from './features/user/dashboard/dashboard';
import { Document } from './features/user/document/document';
import { DocumentPreview } from './features/user/document-preview/document-preview';
import { TemplatesList } from './features/user/templates-list/templates-list';
import { DynamicForm } from './features/user/dynamic-form/dynamic-form';
import { GenerationResult } from './features/user/generation-result/generation-result';
import { DocumentGeneration } from './features/user/document-generation/document-generation';
import { History } from './features/user/history/history';
import { Notifications } from './features/user/notifications/notifications';
import { Profile } from './features/user/profile/profile';
import { SettingsComponent } from './features/user/settings/settings';
import { TemplateCreate } from './features/user/template-create/template-create';
import { TemplateManage } from './features/user/template-manage/template-manage';
import { TemplatePreview } from './features/user/template-preview/template-preview';

export const routes: Routes = [

//   {
//     path: '',
//     redirectTo: 'public',
//     pathMatch: 'full'
//   },

//   // --- TES MODULES (LAZY LOADING) ---
  
//   {
//     // Si tu as une partie publique (Site vitrine), on peut y accéder via /public
//     path: 'public', 
//     loadChildren: () => 
//       import('./features/public/public-routing-module').then(m => m.PublicRoutingModule)
//   },
//   {
//     path: 'auth',
//     loadChildren: () => 
//       import('./features/auth/auth-routing-module').then(m => m.AuthRoutingModule)
//   },
//   {
//     path: 'user',
//     loadChildren: () => 
//       import('./features/user/user-routing-module').then(m => m.UserRoutingModule),
//     canMatch: [authMatchGuard]
//   },
//   {
//     path: 'admin',
//     loadChildren: () => 
//       import('./features/admin/admin-routing-module').then(m => m.AdminRoutingModule)
//   },

//   // --- GESTION DES ERREURS (404) ---
  
//   // Si l'URL n'existe pas, on renvoie vers le login
//   { 
//     path: '**', 
//     redirectTo: 'public' 
//   }

  // Routes publiques
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'faq', component: Faq },
  { path: 'guide', component: Guide },
  { path: 'help', component: Help },
  
  // Routes utilisateur
  { path: 'dashboard', component: Dashboard },
  { path: 'documents', component: Document },
  { path: 'document/:id', component: DocumentPreview },
  { path: 'templates', component: TemplatesList },
  { path: 'template/:id', component: TemplatePreview },
  { path: 'dynamic-form/:id', component: DynamicForm },
  { path: 'generation-result/:id', component: GenerationResult },
  { path: 'document-generation', component: DocumentGeneration },
  { path: 'history', component: History },
  { path: 'notifications', component: Notifications },
  { path: 'profile', component: Profile },
  { path: 'settings', component: SettingsComponent },
  { path: 'template/create', component: TemplateCreate },
  { path: 'template/manage', component: TemplateManage },
  
  // Fallback
  { path: '**', redirectTo: 'home' }

];