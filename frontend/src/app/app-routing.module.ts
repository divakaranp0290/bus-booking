import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/static/about/about.component';
import { CancellationComponent } from './pages/static/cancellation/cancellation.component';
import { ContactComponent } from './pages/static/contact/contact.component';
import { PrivacyComponent } from './pages/static/privacy/privacy.component';
import { TermsComponent } from './pages/static/terms/terms.component';
import { ResultComponent } from './pages/results/result.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'cancellation', component: CancellationComponent },
  { path: 'search', component: ResultComponent },

  // // Redirects
  // { path: 'home', redirectTo: '', pathMatch: 'full' },

  // 404 fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
