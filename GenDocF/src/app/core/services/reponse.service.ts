import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ReponseQuestion, PaginatedResponse } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class ReponseService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'documents/reponses/';

  getReponses(page: number = 1, documentId?: number): Observable<PaginatedResponse<ReponseQuestion>> {
    let url = `${this.endpoint}?page=${page}`;
    if (documentId) {
      url += `&document_genere=${documentId}`;
    }
    return this.apiService.get<PaginatedResponse<ReponseQuestion>>(url);
  }

  getReponse(id: number): Observable<ReponseQuestion> {
    return this.apiService.get<ReponseQuestion>(`${this.endpoint}${id}/`);
  }

  createReponse(reponse: Partial<ReponseQuestion>): Observable<ReponseQuestion> {
    return this.apiService.post<ReponseQuestion>(this.endpoint, reponse);
  }

  updateReponse(id: number, reponse: Partial<ReponseQuestion>): Observable<ReponseQuestion> {
    return this.apiService.put<ReponseQuestion>(`${this.endpoint}${id}/`, reponse);
  }

  deleteReponse(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}${id}/`);
  }

  getReponsesByDocument(documentId: number): Observable<ReponseQuestion[]> {
    return this.apiService.get<ReponseQuestion[]>(`${this.endpoint}?document_genere=${documentId}`);
  }

  createMultipleReponses(reponses: Partial<ReponseQuestion>[]): Observable<ReponseQuestion[]> {
    return this.apiService.post<ReponseQuestion[]>(`${this.endpoint}/bulk-create`, { reponses });
  }
}