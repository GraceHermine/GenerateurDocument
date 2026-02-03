import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public',
  imports: [RouterOutlet, RouterLink, CommonModule, RouterModule ],
  templateUrl: './public.html',
  styleUrl: './public.scss',
})
export class Public {
  isMobileMenuOpen = false;

    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    }
}
