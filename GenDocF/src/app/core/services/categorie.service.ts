import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CategorieTemplate, PaginatedResponse } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'documents/categories/';

  getCategories(page: number = 1): Observable<PaginatedResponse<CategorieTemplate>> {
    return this.apiService.get<PaginatedResponse<CategorieTemplate>>(
      `${this.endpoint}?page=${page}`
    );
  }

  getAllCategories(): Observable<CategorieTemplate[]> {
    return this.apiService.get<any>(this.endpoint).pipe(
      map(response => {
        if (response && response.results && Array.isArray(response.results)) {
          return response.results as CategorieTemplate[];
        }
        return response as CategorieTemplate[] || [];
      })
    );
  }

  getCategorie(id: number): Observable<CategorieTemplate> {
    return this.apiService.get<CategorieTemplate>(`${this.endpoint}${id}/`);
  }

  createCategorie(categorie: Partial<CategorieTemplate>): Observable<CategorieTemplate> {
    return this.apiService.post<CategorieTemplate>(this.endpoint, categorie);
  }

  updateCategorie(id: number, categorie: Partial<CategorieTemplate>): Observable<CategorieTemplate> {
    return this.apiService.put<CategorieTemplate>(`${this.endpoint}${id}/`, categorie);
  }

  deleteCategorie(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}${id}/`);
  }
}
