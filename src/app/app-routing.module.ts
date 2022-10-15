import { NgModule } from '@angular/core';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { RouterModule, Routes } from '@angular/router';

const redirectToLoginPage = () => redirectUnauthorizedTo('/login');

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'apply',
    loadChildren: () => import('./apply/apply.module').then(m => m.ApplyModule),
    ...canActivate(redirectToLoginPage)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    ...canActivate(redirectToLoginPage)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/dashboard',
  },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
