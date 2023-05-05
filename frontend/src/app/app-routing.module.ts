import { Input, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ConfirmationComponent } from './pages/confirmation/confirmation.component';
import { HomeComponent } from './pages/home/home.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { CanAccesService } from './services/canAcces/can-acces.service';
import { HelpsComponent } from './pages/helps/helps.component';
import { EntryPageComponent } from './pages/entry-page/entry-page.component';
import { CalendarComponent } from './components/calendar/calendar.component';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full'  },
    { path: 'confirm/:token', title: "Email confirmation", component: ConfirmationComponent }, 
    {
        path: 'seguimiento-almuerzo',
        component: HomeComponent,
        children: [
            { path: '', redirectTo: 'calendar', pathMatch: 'prefix'},
            { path: 'calendar', title: "Calendario", component: CalendarComponent, canActivate: [CanAccesService] },
            { path: 'users', title: "Listar usuario", component: UsuariosComponent, canActivate: [CanAccesService] },
            { path: 'perfil/:userId', title: "My perfil", component: PerfilComponent, canActivate: [CanAccesService] }, 
            { path: 'helps', title: "Ayudas", component: HelpsComponent }, 
        ]
    },
    { path: 'login', title: "Login", component: EntryPageComponent },
    { path: 'create/user', title: "Crear usuario", component: EntryPageComponent },
    { path: '**', title: "Not Found", component: NotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        anchorScrolling: 'enabled',
        onSameUrlNavigation: 'reload',
        scrollPositionRestoration: 'enabled'
      })],
    exports: [RouterModule]
})
export class AppRoutingModule {  }
