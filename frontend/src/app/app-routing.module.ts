import { Input, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { AngularHelpsComponent } from './pages/angular-helps/angular-helps.component';
import { ConfirmationComponent } from './pages/confirmation/confirmation.component';
import { CreateUserComponent } from './pages/create-user/create-user.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { CanAccesService } from './services/canAcces/can-acces.service';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full' 
    },
    {
        path: 'help',
        title: "Help",
        component: AngularHelpsComponent
    },
    {
        path: 'confirm/:token',
        title: "Email confirmation",
        component: ConfirmationComponent
    },
    {
        path: 'home',
        title: "Home",
        component: HomeComponent,
        canActivate: [CanAccesService]
    },
    {
        path: 'login',
        title: "Login",
        component: LoginComponent
    },
    {
        path: 'create/user',
        title: "Crear usuario",
        component: CreateUserComponent
    },
    {
        path: 'users',
        title: "Listar usuario",
        component: UsuariosComponent,
        canActivate: [CanAccesService]
    },
    {
        path: 'perfil/:userId',
        title: "My perfil",
        component: PerfilComponent,
        canActivate: [CanAccesService]
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
export class AppRoutingModule {  }
