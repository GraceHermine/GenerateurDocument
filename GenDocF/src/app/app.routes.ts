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
// Imports des composants Auth
import { Login } from './features/auth/login/login'; // Vérifiez le chemin exact
import { Register } from './features/auth/register/register'; // Vérifiez le chemin exact
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
import { Public } from '@shared/layouts/public/public';

export const routes: Routes = [

  // ✅ Redirection racine vers /public
  { 
    path: '', 
    redirectTo: 'public', 
    pathMatch: 'full' 
  },

  // ✅ Routes d'Authentification
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: Login },
      { path: 'register', component: Register }
    ]
  },

  // ✅ Routes publiques avec layout (header + footer)
  {
    path: 'public',
    component: Public, // Le layout contenant header et footer
    children: [
      { 
        path: '', 
        component: Home, // /public affiche Home
        pathMatch: 'full' 
      },
      { path: 'about', component: About },       // /public/about
      { path: 'contact', component: Contact },   // /public/contact
      { path: 'faq', component: Faq },           // /public/faq
      { path: 'guide', component: Guide },       // /public/guide
      { path: 'help', component: Help },         // /public/help
    ]
  },

  // ✅ Routes utilisateur (sans le layout Public)
  { path: 'dashboard', component: Dashboard, canMatch: [authMatchGuard] },
  { path: 'documents', component: Document, canMatch: [authMatchGuard] },
  { path: 'document/:id', component: DocumentPreview, canMatch: [authMatchGuard] },
  { path: 'templates', component: TemplatesList, canMatch: [authMatchGuard] },
  { path: 'template/:id', component: TemplatePreview, canMatch: [authMatchGuard] },
  { path: 'dynamic-form/:id', component: DynamicForm, canMatch: [authMatchGuard] },
  { path: 'generation-result/:id', component: GenerationResult, canMatch: [authMatchGuard] },
  { path: 'document-generation', component: DocumentGeneration, canMatch: [authMatchGuard] },
  { path: 'history', component: History, canMatch: [authMatchGuard] },
  { path: 'notifications', component: Notifications, canMatch: [authMatchGuard] },
  { path: 'profile', component: Profile, canMatch: [authMatchGuard] },
  { path: 'settings', component: SettingsComponent, canMatch: [authMatchGuard] },
  { path: 'template/create', component: TemplateCreate, canMatch: [authMatchGuard] },
  { path: 'template/manage', component: TemplateManage, canMatch: [authMatchGuard] },

  // ✅ Fallback - Toute route inconnue redirige vers /public
  { path: '**', redirectTo: 'public' }

];