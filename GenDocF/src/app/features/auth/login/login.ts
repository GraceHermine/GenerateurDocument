import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service'; // Vérifie ce chemin

@Component({
  selector: 'app-login',
  standalone: true,
  // 👇 INDISPENSABLE : ReactiveFormsModule permet de gérer le formulaire
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './login.html', // Vérifie si ton fichier s'appelle login.component.html ou login.html
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // On initialise le formulaire
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email obligatoire
      password: ['', [Validators.required]] // Mot de passe obligatoire
    });
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

    console.log("Tentative de connexion avec :", this.loginForm.value);

    // 2. On appelle le service d'authentification (API)
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('✅ Connexion réussie ! Token reçu.');
        // 3. Si ça marche, on redirige vers l'historique
        this.router.navigate(['/user/history']); 
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