import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, switchMap, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // 1. Connexion
  login(credentials: any): Observable<any> {
    // ✅ TRADUCTION : On transforme 'email' en 'username' pour Django
    const payload = {
      email: credentials.email,
      password: credentials.password
    };

    console.log("Envoi au backend :", payload); // Pour vérifier

    return this.http.post(`${this.apiUrl}/token/`, payload).pipe(
      tap((response: any) => {
        if (response.access && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', response.access);
          if (response.refresh) {
            localStorage.setItem('refresh_token', response.refresh);
          }
          const role = this.getRoleFromToken(response.access);
          if (role) {
            localStorage.setItem('user_role', role);
          }
        }
      }),
      switchMap(() =>
        this.getCurrentUser().pipe(
          tap((user: any) => {
            if (isPlatformBrowser(this.platformId)) {
              const role = this.getRoleFromUser(user);
              if (role) {
                localStorage.setItem('user_role', role);
              }
            }
          }),
          catchError(() => of(null))
        )
      )
    );
  }

  // 1.b Inscription
  register(payload: { firstName: string; lastName: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      password: payload.password
    });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me/`, {
      headers: this.getAuthHeaders()
    });
  }

  // 2. Récupérer le token
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  // 3. Est-ce que l'utilisateur est connecté ?
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): 'admin' | 'user' {
    if (isPlatformBrowser(this.platformId)) {
      const storedRole = localStorage.getItem('user_role');
      if (storedRole === 'admin') {
        return 'admin';
      }
    }
    const token = this.getToken();
    if (token) {
      const role = this.getRoleFromToken(token);
      return role === 'admin' ? 'admin' : 'user';
    }
    return 'user';
  }

  getDefaultRoute(): string {
    return this.getUserRole() === 'admin' ? '/admin' : '/user';
  }

  private getRoleFromToken(token: string): 'admin' | 'user' | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      if (decoded?.is_superuser || decoded?.is_staff || decoded?.role === 'admin') {
        return 'admin';
      }
      return 'user';
    } catch {
      return null;
    }
  }

  private getRoleFromUser(user: any): 'admin' | 'user' | null {
    if (!user) {
      return null;
    }
    if (user.is_superuser || user.is_staff || user.role === 'admin') {
      return 'admin';
    }
    return 'user';
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // 4. Déconnexion
  logoutRequest(): Observable<any> {
    const refresh = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('refresh_token')
      : null;

    return this.http.post(
      `${this.apiUrl}/auth/logout/`,
      { refresh },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(() => of(null))
    );
  }

  getUserInfo() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      // Le token JWT est composé de 3 parties séparées par des points. 
      // La 2ème partie (index 1) contient les données (payload).
      const payload = token.split('.')[1];
      const decodedData = JSON.parse(atob(payload));
      
      // Django (SimpleJWT) inclut souvent l'user_id, mais pas forcément le prénom par défaut.
      // Si vous avez configuré Django pour inclure le prénom, il sera ici.
      return decodedData;
    } catch (e) {
      return null;
    }
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/auth/me/`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      })
    });
  }

  clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
    }
  }
}