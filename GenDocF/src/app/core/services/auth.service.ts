import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; 

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // 1. Connexion
  login(credentials: any): Observable<any> {
    // ✅ TRADUCTION : On transforme 'email' en 'username' pour Django
    const payload = {
      username: credentials.email, // On met l'email dans le champ username
      password: credentials.password
    };

    console.log("Envoi au backend :", payload); // Pour vérifier

    return this.http.post(`${this.apiUrl}/auth/token/`, payload).pipe(
      tap((response: any) => {
        if (response.access && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', response.access);
          if (response.refresh) {
            localStorage.setItem('refresh_token', response.refresh);
          }
        }
      })
    );
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

  // 4. Déconnexion
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
}