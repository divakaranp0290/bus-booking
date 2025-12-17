import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  activeTab: 'bus' | 'flight' = 'bus';
  mobileMenuOpen = false;

  get indicatorTransform() {
  return this.activeTab === 'bus'
    ? 'translateX(0)'
    : 'translateX(70px)';
}


  selectTab(tab: 'bus' | 'flight') {
    this.activeTab = tab;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
