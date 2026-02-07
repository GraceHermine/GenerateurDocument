import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Chemin vérifié : environment.ts existe bien ici
import { environment } from '../../../environments/environment';

// ✅ Correction ici : On pointe vers 'auth.service' et non 'auth'
import { AuthService } from './auth.service'; 

// ✅ Import du modèle
import { DocumentHistory } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  // L'URL correspond à ton backend : api/documents/documents/
  private apiUrl = `${environment.apiUrl}/documents/documents`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Ajoute le token JWT dans l'en-tête pour prouver qu'on est connecté
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // 1. Récupérer l'historique (GET)
  getUserDocuments(): Observable<DocumentHistory[]> {
    return this.http.get<DocumentHistory[]>(`${this.apiUrl}/`, { headers: this.getHeaders() });
  }

  // 2. Télécharger un document (GET Blob)
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download/`, {
      headers: this.getHeaders(),
      responseType: 'blob' // Indispensable pour dire à Angular que c'est un fichier
    });
  }
}