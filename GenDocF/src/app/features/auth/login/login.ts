import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, LoginRequest } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
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
