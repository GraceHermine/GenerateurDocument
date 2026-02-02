import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { User } from '../../shared/layouts/user/user';
import { Dashboard } from './dashboard/dashboard';
import { Profile } from './profile/profile';
import { History } from './history/history';
import { Document } from './document/document';
import { TemplatesList } from './templates-list/templates-list';
import { TemplatePreview } from './template-preview/template-preview';
import { TemplateManage } from './template-manage/template-manage';
import { TemplateCreate } from './template-create/template-create';
import { DocumentGeneration } from './document-generation/document-generation';
import { DynamicForm } from './dynamic-form/dynamic-form';
import { GenerationResult } from './generation-result/generation-result';
import { DocumentPreview } from './document-preview/document-preview';
import { Notifications } from './notifications/notifications';

// 1. IMPORT DU COMPOSANT SETTINGS (Indispensable)
import { SettingsComponent } from './settings/settings';

const routes: Routes = [
  { path: '', component: User, children: [
      { path: '', component: Dashboard },
      { path: 'profile', component: Profile },
      { path: 'history', component: History },
      { path: 'document', component: Document },
      { path: 'templates-list', component: TemplatesList },
      { path: 'template-preview', component: TemplatePreview },
      { path: 'template-management', component: TemplateManage },
      { path: 'template-create', component: TemplateCreate },
      { path: 'document-generation', component: DocumentGeneration },
      { path: 'dynamic-form', component: DynamicForm },
      { path: 'generation-result', component: GenerationResult },
      { path: 'document-preview', component: DocumentPreview },
      { path: 'notifications', component: Notifications },
      
      // 2. LA ROUTE SETTINGS (C'est elle qui fait le lien avec l'URL /user/settings)
      { path: 'settings', component: SettingsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}