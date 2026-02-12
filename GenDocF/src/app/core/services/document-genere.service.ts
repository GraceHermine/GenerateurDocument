import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DocumentGenere, DocumentHistory, PaginatedResponse } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentGenereService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'documents/documents/';

  getDocuments(page: number = 1, statut?: string): Observable<PaginatedResponse<DocumentGenere>> {
    let url = `${this.endpoint}?page=${page}`;
    if (statut) {
      url += `&statut=${statut}`;
    }
    return this.apiService.get<PaginatedResponse<DocumentGenere>>(url);
  }

  getDocument(id: number): Observable<DocumentGenere> {
    return this.apiService.get<DocumentGenere>(`${this.endpoint}${id}`);
  }

  createDocument(document: Partial<DocumentGenere>): Observable<DocumentGenere> {
    return this.apiService.post<DocumentGenere>(this.endpoint, document);
  }

  updateDocument(id: number, document: Partial<DocumentGenere>): Observable<DocumentGenere> {
    return this.apiService.put<DocumentGenere>(`${this.endpoint}${id}/`, document);
  }

  deleteDocument(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}${id}/`);
  }

  finaliserDocument(id: number): Observable<DocumentGenere> {
    return this.apiService.post<DocumentGenere>(`${this.endpoint}${id}/finaliser/`, {});
  }

  archiverDocument(id: number): Observable<DocumentGenere> {
    return this.apiService.post<DocumentGenere>(`${this.endpoint}${id}/archiver/`, {});
  }

  // Historique des documents de l'utilisateur connecté
  getUserHistory(): Observable<DocumentHistory[]> {
    return this.apiService.get<DocumentHistory[]>(`${this.endpoint}history/`);
  }

  // CORRIGÉ : Utiliser downloadFile au lieu de get
  downloadDocument(id: number): Observable<Blob> {
    return this.apiService.downloadFile(`${this.endpoint}${id}/download/`);
  }
}