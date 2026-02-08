<<<<<<< HEAD
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, LoginRequest } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';
=======
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service'; // Vérifie ce chemin
>>>>>>> fix-frontend-startup

@Component({
  selector: 'app-login',
  standalone: true,
<<<<<<< HEAD
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  showPassword = false;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const credentials: LoginRequest = {
      email: this.form.value.email,
      password: this.form.value.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        
        // Sauvegarder le "remember me"
        if (this.form.value.remember) {
          localStorage.setItem('remember_me', 'true');
          localStorage.setItem('saved_email', credentials.email);
        }

        // Redirection après 1 seconde
        setTimeout(() => {
          this.router.navigate(['/user/dashboard']);
        }, 1000);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.detail || 'Identifiants invalides. Veuillez réessayer.';
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Pré-remplir le formulaire si "remember me" était coché
  ngAfterViewInit(): void {
    if (localStorage.getItem('remember_me') === 'true') {
      const savedEmail = localStorage.getItem('saved_email');
      if (savedEmail) {
        this.form.patchValue({
          email: savedEmail,
          remember: true,
        });
      }
    }
  }
}
=======
  // 👇 INDISPENSABLE : ReactiveFormsModule permet de gérer le formulaire
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './login.html', // Vérifie si ton fichier s'appelle login.component.html ou login.html
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
    // On initialise le formulaire
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email obligatoire
      password: ['', [Validators.required]] // Mot de passe obligatoire
    });

    const registered = this.route.snapshot.queryParamMap.get('registered');
    if (registered === '1') {
      this.successMessage = "Compte cree avec succes. Vous pouvez vous connecter.";
    }
  }

  // Cette fonction se lance quand tu cliques sur le bouton
  onSubmit(): void {
    // 1. Si le formulaire est invalide (champs vides), on arrête tout
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Affiche les erreurs en rouge
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    console.log("Tentative de connexion avec :", this.loginForm.value);

    // 2. On appelle le service d'authentification (API)
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        console.log('✅ Connexion réussie ! Token reçu.');
        // 3. Redirection selon le role (user/admin)
        this.router.navigate([this.authService.getDefaultRoute()]);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur login:', err);
        this.isLoading = false;
        
        // Gestion des messages d'erreur
        if (err.status === 401) {
          this.errorMessage = "Email ou mot de passe incorrect.";
        } else if (err.status === 0) {
          this.errorMessage = "Impossible de contacter le serveur (Vérifie que le Backend tourne).";
        } else {
          this.errorMessage = "Une erreur est survenue.";
        }
      }
    });
  }
}
>>>>>>> fix-frontend-startup
