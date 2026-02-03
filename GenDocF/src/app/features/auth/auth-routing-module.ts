import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Auth } from '../../shared/layouts/auth/auth';
import { Login } from './login/login';
import { Register } from './register/register';
import { Forgot } from './forgot/forgot';
import { Logout } from './logout/logout';

const routes: Routes = [
  { path: '', component: Auth, children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'forgot-password', component: Forgot },
      { path: 'logout', component: Logout },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
