import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'choice',
    loadComponent: () => import('./pages/choice/choice.page').then( m => m.ChoicePage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'create-ride',
    loadComponent: () => import('./pages/create-ride/create-ride.page').then( m => m.CreateRidePage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'pegar-carona',
    loadComponent: () => import('./pages/pegar-carona/pegar-carona.page').then( m => m.PegarCaronaPage)
  }
];
