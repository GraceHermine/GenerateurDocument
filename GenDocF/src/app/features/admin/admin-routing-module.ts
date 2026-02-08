import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Imports des composants
// (Les chemins semblent corrects basés sur ton arborescence)
import { Admin } from '../../shared/layouts/admin/admin';
import { Dashboard } from './dashboard/dashboard';
import { UserManage } from './user-manage/user-manage';
import { Document } from './document/document';
import { Settings } from './settings/settings';
import { Site } from './site/site';

import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { 
    path: '', 
    component: Admin, // Layout principal Admin
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', component: Dashboard }, // Route par défaut (/admin)
      { path: 'user-management', component: UserManage },
      { path: 'document-management', component: Document },
      { path: 'settings', component: Settings },
      { path: 'site-settings', component: Site },
    ]
  }
];

@NgModule({
  // ✅ IMPORTANT : Toujours 'forChild' ici, jamais 'forRoot'
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}