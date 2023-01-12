import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularHelpsComponent } from './pages/angular-helps/angular-helps.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'help', component: AngularHelpsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
