import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LayoutModule } from './layout/layout.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HeaderComponent } from './layout/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { RouterModule } from '@angular/router';
import { AboutComponent } from './pages/static/about/about.component';
import { CancellationComponent } from './pages/static/cancellation/cancellation.component';
import { ContactComponent } from './pages/static/contact/contact.component';
import { PrivacyComponent } from './pages/static/privacy/privacy.component';
import { TermsComponent } from './pages/static/terms/terms.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ResultComponent } from './pages/results/result.component';
import { SeatLayoutComponent } from './pages/seat/seat-layout.component';

@NgModule({
  declarations: [AppComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    PrivacyComponent,
    TermsComponent,
    CancellationComponent,
    ResultComponent,
    SeatLayoutComponent

  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    RouterModule,
    AppRoutingModule,
    LayoutModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
