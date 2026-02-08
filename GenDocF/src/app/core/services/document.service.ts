import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DocumentGenere, PaginatedResponse, DocumentHistory } from '../models/document.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentGenereService {

  private readonly apiService = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly endpoint = 'documents/documents';
  private readonly apiUrl = `${environment.apiUrl}/documents/documents`;

  // 📄 Liste paginée
  getDocuments(page: number = 1, statut?: string): Observable<PaginatedResponse<DocumentGenere>> {
    let url = `${this.endpoint}?page=${page}`;
    if (statut) {
      url += `&statut=${statut}`;
    }
    return this.apiService.get<PaginatedResponse<DocumentGenere>>(url);
  }

  // 📄 Détail
  getDocument(id: number): Observable<DocumentGenere> {
    return this.apiService.get<DocumentGenere>(`${this.endpoint}/${id}`);
  }

  // ➕ Création
  createDocument(document: Partial<DocumentGenere>): Observable<DocumentGenere> {
    return this.apiService.post<DocumentGenere>(this.endpoint, document);
  }

  // ✏️ Update
  updateDocument(id: number, document: Partial<DocumentGenere>): Observable<DocumentGenere> {
    return this.apiService.put<DocumentGenere>(`${this.endpoint}/${id}`, document);
  }

  // ❌ Delete
  deleteDocument(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  // ✅ Finaliser
  finaliserDocument(id: number): Observable<DocumentGenere> {
    return this.apiService.post<DocumentGenere>(`${this.endpoint}/${id}/finaliser`, {});
  }

  // 📦 Archiver
  archiverDocument(id: number): Observable<DocumentGenere> {
    return this.apiService.post<DocumentGenere>(`${this.endpoint}/${id}/archiver`, {});
  }

  // 📜 Historique utilisateur
  getUserDocuments(): Observable<DocumentHistory[]> {
    return this.http.get<DocumentHistory[]>(`${this.apiUrl}/`, { headers: this.getHeaders() });
  }

  // ⬇️ Télécharger
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download/`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // 🔐 Header JWT
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
