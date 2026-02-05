import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, RegisterRequest } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  showPassword = false;
  showConfirmPassword = false;
  fieldErrors: { [key: string]: string | null } = {};

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(90)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator.bind(this)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
    }, { validators: this.passwordMatchValidator.bind(this) });
  }

  // Validateur de force de mot de passe
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumbers;

    return !passwordValid ? { passwordStrength: true } : null;
  }

  // Validateur de correspondance des mots de passe
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // Marquer tous les champs comme "touched" pour afficher les erreurs
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const registerData: RegisterRequest = {
      nom: this.form.value.nom,
      prenom: this.form.value.prenom,
      email: this.form.value.email,
      password: this.form.value.password,
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;

        // Auto-connexion après inscription
        setTimeout(() => {
          this.authService.login({
            email: registerData.email,
            password: registerData.password,
          }).subscribe({
            next: () => {
              this.router.navigate(['/user/dashboard']);
            },
            error: () => {
              // En cas d'erreur, rediriger vers la page de connexion
              this.router.navigate(['/auth/login']);
            },
          });
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        if (error.error && typeof error.error === 'object') {
          // Erreurs spécifiques par champ
          if (error.error.nom) {
            this.error = 'Le nom est invalide.';
          } else if (error.error.prenom) {
            this.error = 'Le prénom est invalide.';
          } else if (error.error.email) {
            this.error = 'Cet email est déjà utilisé.';
          } else {
            this.error = error.error.detail || 'Erreur lors de l\'inscription. Veuillez réessayer.';
          }
        } else {
          this.error = 'Une erreur est survenue. Veuillez réessayer.';
        }
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Helpers pour les messages d'erreur
  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.touched || !field.errors) return null;

    if (field.errors['required']) return `${fieldName} est obligatoire.`;
    if (field.errors['minlength']) return `${fieldName} doit avoir au moins ${field.errors['minlength'].requiredLength} caractères.`;
    if (field.errors['maxlength']) return `${fieldName} ne doit pas dépasser ${field.errors['maxlength'].requiredLength} caractères.`;
    if (field.errors['email']) return 'Email invalide.';
    if (field.errors['passwordStrength']) return 'Le mot de passe doit contenir des majuscules, minuscules et des chiffres.';
    if (fieldName === 'confirmPassword' && this.form.errors?.['passwordMismatch']) {
      return 'Les mots de passe ne correspondent pas.';
    }

    return null;
  }

  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') && 
           (this.form.get('confirmPassword')?.touched ?? false);
  }
}
