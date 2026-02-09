
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = 'http://localhost:8000/api/auth';
  
  public tokenSubject = new BehaviorSubject<string | null>(this.getTokenFromStorage());
  public token$ = this.tokenSubject.asObservable();
  
  public isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getTokenFromStorage());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Initialiser l'état d'authentification au démarrage
    const token = this.getTokenFromStorage();
    if (token) {
      this.tokenSubject.next(token);
      this.isAuthenticatedSubject.next(true);
    }
  }

  // Login
  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/token/`, credentials).pipe(
      tap((response) => {
        this.setToken(response.access);
        if (response.refresh) {
          localStorage.setItem('refresh_token', response.refresh);
        }
      })
    );
  }

  // Register
  register(data: RegisterRequest): Observable<{ message: string; user_id: number }> {
    return this.http.post<{ message: string; user_id: number }>(`${this.apiUrl}/register/`, data);
  }

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.tokenSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  // Définir le token
  setToken(token: string): void {
    localStorage.setItem('access_token', token);
    this.tokenSubject.next(token);
    this.isAuthenticatedSubject.next(true);
  }

  // Récupérer le token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Récupérer le token depuis le stockage
  private getTokenFromStorage(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  // Vérifier l'authentification
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Rafraîchir le token
  refreshToken(refreshToken: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/token/refresh/`, {
      refresh: refreshToken,
    }).pipe(
      tap((response) => {
        this.setToken(response.access);
      })
    );
  }
}

