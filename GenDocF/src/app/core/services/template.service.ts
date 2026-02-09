import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TemplateDocument, PaginatedResponse } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'api/documents/templates';

  getTemplates(page: number = 1, categorieId?: number): Observable<PaginatedResponse<TemplateDocument>> {
    let url = `${this.endpoint}?page=${page}`;
    if (categorieId) {
      url += `&categorie=${categorieId}`;
    }
    return this.apiService.get<PaginatedResponse<TemplateDocument>>(url);
  }

  getAllTemplates(): Observable<TemplateDocument[]> {
    return this.apiService.get<TemplateDocument[]>(this.endpoint);
  }

  getTemplate(id: number): Observable<TemplateDocument> {
    return this.apiService.get<TemplateDocument>(`${this.endpoint}/${id}`);
  }

  createTemplate(template: Partial<TemplateDocument>): Observable<TemplateDocument> {
    return this.apiService.post<TemplateDocument>(this.endpoint, template);
  }

  updateTemplate(id: number, template: Partial<TemplateDocument>): Observable<TemplateDocument> {
    return this.apiService.put<TemplateDocument>(`${this.endpoint}/${id}`, template);
  }

  deleteTemplate(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  getTemplatesByCategorie(categorieId: number): Observable<TemplateDocument[]> {
    return this.apiService.get<TemplateDocument[]>(`${this.endpoint}?categorie=${categorieId}`);
  }
}