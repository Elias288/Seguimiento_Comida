import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { AngularHelpsComponent } from './pages/angular-helps/angular-helps.component';
import { LoginComponent } from './pages/login/login.component';
import { CreateUserComponent } from './pages/create-user/create-user.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { MaterialModule } from './components/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CanAccesService } from './services/canAcces/can-acces.service';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { CalendarComponent } from './components/calendar/calendar.component';
import { MenuDialogComponent } from './components/menu-dialog/menu-dialog.component';
import { CreateMenuDialogComponent } from './components/create-menu-dialog/create-menu-dialog.component';
import { ConfirmCancelDialogComponent } from './components/confirm-cancel-dialog/confirm-cancel-dialog.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { UsersTableComponent } from './components/users-table/users-table.component';
import { RolesFormComponent } from './components/roles-form/roles-form.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ConfirmationComponent } from './pages/confirmation/confirmation.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';'@angular/material/core';
import {
    MAT_MOMENT_DATE_FORMATS,
    MomentDateAdapter,
    MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  } from '@angular/material-moment-adapter';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    AngularHelpsComponent,
    CreateUserComponent,
    NotFoundComponent,
    NavBarComponent,
    CalendarComponent,
    MenuDialogComponent,
    CreateMenuDialogComponent,
    ConfirmCancelDialogComponent,
    UsuariosComponent,
    UsersTableComponent,
    RolesFormComponent,
    PerfilComponent,
    ConfirmationComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    CanAccesService,
    {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},
    {
        provide: DateAdapter,
        useClass: MomentDateAdapter,
        deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
