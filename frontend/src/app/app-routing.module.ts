import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AngularHelpsComponent } from './pages/angular-helps/angular-helps.component';
import { CreateUserComponent } from './pages/create-user/create-user.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full' },
  {
    path: 'help',
    title: "Help",
    component: AngularHelpsComponent
  },
  {
    path: 'home',
    title: "Home",
    component: HomeComponent
  },
  {
    path: 'login',
    title: "Login",
    component: LoginComponent
  },
  {
    path: 'create',
    title: "Create",
    component: CreateUserComponent
  },
  {
    path: '**',
    title: "Not Found",
    component: NotFoundComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
