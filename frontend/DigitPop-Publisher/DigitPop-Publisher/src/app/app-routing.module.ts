import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Import your components
import { RegistrationComponent } from '../app/registration/registration.component';
import { HomeComponent } from './home/home.component';
import { PublisherSigninComponent } from './publisher-signin/publisher-signin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AssetCreationComponent } from './asset-creation-wizard/asset-creation-wizard.component';
import { AssetEditComponent } from './asset-edit/asset-edit.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },  // redirect to `home-component`
  { path: 'register', component: RegistrationComponent },
  { path: 'home', component: HomeComponent },
  { path: 'signin', component: PublisherSigninComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'asset-creation-wizard', component: AssetCreationComponent },
  { path: 'asset-edit/:id', component: AssetEditComponent}
  // More routes can be added here
];


const routerModule = RouterModule.forRoot(routes);

@NgModule({
  imports: [routerModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }

