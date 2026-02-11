import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user: any = null;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = {
          prenom: user?.prenom ?? user?.first_name ?? '',
          nom: user?.nom ?? user?.last_name ?? '',
          email: user?.email ?? user?.username ?? ''
        };
        this.cdr.detectChanges();
      },
      error: () => {
        this.user = null;
        this.cdr.detectChanges();
      } 
    });
  }

  get fullName(): string {
    const prenom = this.user?.prenom || '';
    const nom = this.user?.nom || '';
    const full = `${prenom} ${nom}`.trim();
    return full || 'Utilisateur';
  }

  get email(): string {
    return this.user?.email || 'email@exemple.com';
  }

}
