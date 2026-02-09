import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './logout.html',
  styleUrls: ['./logout.scss'],
})
export class Logout implements OnInit {
  isLoading = true;
  message = 'Deconnexion en cours...';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.logoutRequest().subscribe({
      next: () => {
        this.authService.clearSession();
        this.message = 'Deconnexion reussie.';
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.authService.clearSession();
        this.message = 'Deconnexion reussie.';
        this.isLoading = false;
        this.router.navigate(['/']);
      }
    });
  }
}
