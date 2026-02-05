import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-public',
  imports: [RouterOutlet, RouterLink, CommonModule, RouterModule ],
  templateUrl: './public.html',
  styleUrl: './public.scss',
})
export class Public {
  private authService = inject(Auth);
  isAuthenticated$ = this.authService.isAuthenticatedSubject;
  isMobileMenuOpen = false;

    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    }
}
