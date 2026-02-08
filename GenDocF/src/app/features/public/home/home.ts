import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { CategorieTemplate, PaginatedResponse } from '../../../core/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class Home {
  private readonly apiService = inject(ApiService);
  
  // ESSAYEZ CES ENDPOINTS DIFFÉRENTS :
  // private readonly endpoint = 'documents/categories'; // Votre endpoint actuel
  // private readonly endpoint = 'api/categories/';      // Peut-être avec api/
  // private readonly endpoint = 'categories/';          // Simple
  // private readonly endpoint = 'template-categories/'; // Spécifique aux templates
  private readonly endpoint = 'categories/'; // Commencez par celui-ci

  getAllCategories(): Observable<CategorieTemplate[]> {
    console.log('🔍 Appel API à:', this.endpoint);
    
    return this.apiService.get<any>(this.endpoint).pipe(
      map(response => {
        console.log('🔍 Réponse API brute:', response);
        
        // Gestion de différents formats de réponse
        if (Array.isArray(response)) {
          return response;
        } else if (response && Array.isArray(response.results)) {
          return response.results;
        } else if (response && Array.isArray(response.data)) {
          return response.data;
        } else if (response && typeof response === 'object') {
          // Essayez de convertir l'objet en tableau
          const arr = Object.values(response);
          return Array.isArray(arr) ? arr : [];
        } else {
          console.warn('Format de réponse inattendu:', response);
          return [];
        }
      }),
      catchError(error => {
        console.error('❌ Erreur API catégories:', error);
        
        // Retournez des données mockées pour développement
        const mockData: CategorieTemplate[] = [
          { id: 1, nom: 'TEST - Attestations', description: 'Description test 1' },
          { id: 2, nom: 'TEST - Travail', description: 'Description test 2' },
          { id: 3, nom: 'TEST - Vie quotidienne', description: 'Description test 3' }
        ];
        
        return of(mockData);
      })
    );
  }
  
  // ... autres méthodes
}