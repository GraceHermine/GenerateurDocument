import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // const token = this.getAuthToken();
    // if (token) {
    //   headers = headers.set('Authorization', `Bearer ${token}`);
    // }

    return headers;
  }

  // private getAuthToken(): string | null {
  //   if (typeof window !== 'undefined') {
  //     return localStorage.getItem('authToken');
  //   }
  //   return null;
  // }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    // Simplifié : ne pas utiliser ErrorEvent qui cause des problèmes SSR
    if (error.status === 0) {
      errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else if (error.status === 401) {
      errorMessage = 'Non autorisé. Veuillez vous connecter.';
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé.';
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée.';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    } else {
      errorMessage = error.error?.message || error.message || `Erreur ${error.status}`;
    }

    console.error('Erreur API:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  uploadFile<T>(endpoint: string, formData: FormData): Observable<T> {
    let headers = new HttpHeaders();
    
    // const token = this.getAuthToken();
    // if (token) {
    //   headers = headers.set('Authorization', `Bearer ${token}`);
    // }

    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData, {
      headers: headers
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  downloadFile(endpoint: string): Observable<Blob> {
    let headers = new HttpHeaders();
    
    // const token = this.getAuthToken();
    // if (token) {
    //   headers = headers.set('Authorization', `Bearer ${token}`);
    // }

    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      headers: headers,
      responseType: 'blob' as 'json'
    }) as Observable<Blob>;
  }
}