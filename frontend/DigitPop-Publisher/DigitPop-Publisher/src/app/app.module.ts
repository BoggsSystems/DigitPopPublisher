import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistrationComponent } from './registration/registration.component';
import { MatStepperModule } from '@angular/material/stepper';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PublisherSigninComponent } from './publisher-signin/publisher-signin.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from './navbar/navbar.component';
import { AssetCreationComponent } from './asset-creation-wizard/asset-creation-wizard.component';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';
import { ConfirmDialogComponent } from './confirm-dialog-component/confirm-dialog-component.component';
import { SpinnerInterceptor } from './http.interceptor';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AssetEditComponent } from './asset-edit/asset-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    PublisherSigninComponent,
    DashboardComponent,
    AssetCreationComponent,
    ConfirmDialogComponent,
    AssetEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatMenuModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FontAwesomeModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}
