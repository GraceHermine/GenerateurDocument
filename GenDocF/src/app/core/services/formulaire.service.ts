import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Formulaire, PaginatedResponse } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class FormulaireService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'documents/formulaires';

  getFormulaires(page: number = 1): Observable<PaginatedResponse<Formulaire>> {
    return this.apiService.get<PaginatedResponse<Formulaire>>(
      `${this.endpoint}?page=${page}`
    );
  }

  getFormulaire(id: number): Observable<Formulaire> {
    return this.apiService.get<Formulaire>(`${this.endpoint}/${id}`);
  }

  createFormulaire(formulaire: Partial<Formulaire>): Observable<Formulaire> {
    return this.apiService.post<Formulaire>(this.endpoint, formulaire);
  }

  updateFormulaire(id: number, formulaire: Partial<Formulaire>): Observable<Formulaire> {
    return this.apiService.put<Formulaire>(`${this.endpoint}/${id}`, formulaire);
  }

  deleteFormulaire(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  getFormulairesByTemplate(templateId: number): Observable<Formulaire[]> {
    return this.apiService.get<Formulaire[]>(`${this.endpoint}?template=${templateId}`);
  }
}