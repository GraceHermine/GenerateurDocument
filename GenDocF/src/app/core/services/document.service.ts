import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DocumentGenere, PaginatedResponse } from '../models/document.model';

import { HttpClient, HttpHeaders } from '@angular/common/http';


// ✅ Chemin vérifié : environment.ts existe bien ici
import { environment } from '../../../environments/environment';

// ✅ Correction ici : On pointe vers 'auth.service' et non 'auth'
import { AuthService } from './auth.service'; 

// ✅ Import du modèle
// import { DocumentHistory } from '../models/document.model';


@Injectable({
  providedIn: 'root'
})

export class DocumentGenereService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'documents/documents';

  getDocuments(page: number = 1, statut?: string): Observable<PaginatedResponse<DocumentGenere>> {
    let url = `${this.endpoint}?page=${page}`;
    if (statut) {
      url += `&statut=${statut}`;
    }
    return this.apiService.get<PaginatedResponse<DocumentGenere>>(url);
  }

  getDocument(id: number): Observable<DocumentGenere> {
    return this.apiService.get<DocumentGenere>(`${this.endpoint}/${id}`);
  }

  createDocument(document: Partial<DocumentGenere>): Observable<DocumentGenere> {
    return this.apiService.post<DocumentGenere>(this.endpoint, document);
  }

  updateDocument(id: number, document: Partial<DocumentGenere>): Observable<DocumentGenere> {
    return this.apiService.put<DocumentGenere>(`${this.endpoint}/${id}`, document);
  }

  deleteDocument(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  finaliserDocument(id: number): Observable<DocumentGenere> {
    return this.apiService.post<DocumentGenere>(`${this.endpoint}/${id}/finaliser`, {});
  }

  archiverDocument(id: number): Observable<DocumentGenere> {
    return this.apiService.post<DocumentGenere>(`${this.endpoint}/${id}/archiver`, {});
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.apiService.downloadFile(`${this.endpoint}/${id}/download`); // ✅


  // // Ajoute le token JWT dans l'en-tête pour prouver qu'on est connecté
  // private getHeaders(): HttpHeaders {
  //   const token = this.authService.getToken();
  //   return new HttpHeaders({
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   });
  // }

  // // 1. Récupérer l'historique (GET)
  // getUserDocuments(): Observable<DocumentHistory[]> {
  //   return this.http.get<DocumentHistory[]>(`${this.apiUrl}/`, { headers: this.getHeaders() });
  // }

  // // 2. Télécharger un document (GET Blob)
  // downloadDocument(id: number): Observable<Blob> {
  //   return this.http.get(`${this.apiUrl}/${id}/download/`, {
  //     headers: this.getHeaders(),
  //     responseType: 'blob' // Indispensable pour dire à Angular que c'est un fichier
  //   });
  }
}