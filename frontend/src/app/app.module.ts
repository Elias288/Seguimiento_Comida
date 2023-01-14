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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    AngularHelpsComponent,
    CreateUserComponent,
    NotFoundComponent,
    NavBarComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [CanAccesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
