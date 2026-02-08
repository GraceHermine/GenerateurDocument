import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const payload = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/auth/login'], {
          queryParams: { registered: '1' }
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur.';
        } else if (err.status === 400) {
          this.errorMessage = this.formatBackendErrors(err.error) || 'Veuillez verifier les informations saisies.';
        } else {
          this.errorMessage = 'Une erreur est survenue.';
        }
      }
    });
  }

  private formatBackendErrors(errors: any): string | null {
    if (!errors || typeof errors !== 'object') {
      return null;
    }

    const messages: string[] = [];
    Object.keys(errors).forEach((key) => {
      const value = errors[key];
      if (Array.isArray(value) && value.length > 0) {
        messages.push(`${key}: ${value[0]}`);
      }
    });

    return messages.length > 0 ? messages.join(' | ') : null;
  }

}
