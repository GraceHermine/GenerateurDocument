import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs'; // 👈 AJOUT IMPORTANT : 'map'

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { DocumentHistory } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents/documents`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // 👇 C'EST ICI LA CORRECTION MAGIQUE
  getUserDocuments(): Observable<DocumentHistory[]> {
    return this.http.get<any>(`${this.apiUrl}/`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log("📦 Réponse brute API Django:", response); // Pour voir ce que Django envoie

          // Cas 1 : Django envoie une pagination ({ count: 2, results: [...] })
          if (response.results && Array.isArray(response.results)) {
            return response.results;
          }
          
          // Cas 2 : Django envoie directement une liste ([...])
          if (Array.isArray(response)) {
            return response;
          }

          // Cas 3 : Vide ou format inconnu
          return [];
        })
      );
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download/`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }
}