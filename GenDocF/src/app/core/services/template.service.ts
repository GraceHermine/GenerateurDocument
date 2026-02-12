import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TemplateDocument, PaginatedResponse } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'documents/templates/';

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
    return this.apiService.get<TemplateDocument>(`${this.endpoint}${id}`);
  }

  createTemplate(data: { nom: string; categorie: number; fichier?: File }): Observable<TemplateDocument> {
    const formData = new FormData();
    formData.append('nom', data.nom);
    formData.append('categorie', data.categorie.toString());
    if (data.fichier) {
      formData.append('fichier', data.fichier);
    }
    return this.apiService.uploadFile<TemplateDocument>(this.endpoint, formData);
  }

  updateTemplate(id: number, template: Partial<TemplateDocument>): Observable<TemplateDocument> {
    return this.apiService.put<TemplateDocument>(`${this.endpoint}${id}`, template);
  }

  deleteTemplate(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}${id}`);
  }

  getTemplatesByCategorie(categorieId: number): Observable<TemplateDocument[]> {
    return this.apiService.get<TemplateDocument[]>(`${this.endpoint}?categorie=${categorieId}`);
  }
}