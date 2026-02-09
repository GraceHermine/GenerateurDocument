import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });

    const registered = this.route.snapshot.queryParamMap.get('registered');
    if (registered === '1') {
      this.successMessage = 'Compte créé avec succès. Vous pouvez vous connecter.';
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        // On force la redirection vers /dashboard pour contourner le problème de getDefaultRoute()
        this.router.navigate(['/user']); 
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la connexion.';
        }
      }
    });
  }
}