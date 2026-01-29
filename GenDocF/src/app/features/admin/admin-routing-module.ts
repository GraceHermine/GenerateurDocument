import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Admin } from '../../shared/layouts/admin/admin';
import { Dashboard } from './dashboard/dashboard';
import { UserManage } from './user-manage/user-manage';
import { Document } from './document/document';
import { Settings } from './settings/settings';
import { Site } from './site/site';

const routes: Routes = [
  { path: '', component: Admin, children: [
      { path: '', component: Dashboard },
      { path: 'user-management', component: UserManage },
      { path: 'document-management', component: Document },
      { path: 'settings', component: Settings },
      { path: 'site-settings', component: Site },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
