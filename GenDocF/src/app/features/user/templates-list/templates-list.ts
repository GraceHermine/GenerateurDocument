import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-templates-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './templates-list.html',
  styleUrl: './templates-list.scss',
})
export class TemplatesList implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private apiUrl = 'http://127.0.0.1:8000/api/documents';

  categories: Array<{ id: number; nom: string; icone?: string }> = [];
  currentCategory: number | 'all' = 'all';
  templates: Array<{ id: number; nom: string; categorie_nom?: string; date_add?: string }> = [];
  isLoading = true;

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const cat = params.get('category');
      this.currentCategory = cat ? (isNaN(+cat) ? 'all' : +cat) : 'all';
      this.loadTemplates();
    });
    this.loadCategories();
  }

  loadCategories() {
    this.http
      .get<any>(`${this.apiUrl}/categories/`)
      .pipe(map((resp) => (Array.isArray(resp) ? resp : (resp?.results ?? []))))
      .subscribe({
        next: (items: any[]) => {
          this.categories = items.map(c => ({ id: c.id, nom: c.nom, icone: c.icone }));
        },
        error: () => {
          this.categories = [];
        }
      });
  }

  loadTemplates() {
    this.isLoading = true;
    const url = this.currentCategory === 'all'
      ? `${this.apiUrl}/templates/`
      : `${this.apiUrl}/templates/?categorie=${this.currentCategory}`;

    this.http
      .get<any>(url)
      .pipe(map((resp) => (Array.isArray(resp) ? resp : (resp?.results ?? []))))
      .subscribe({
        next: (items: any[]) => {
          this.templates = items.map(t => ({
            id: t.id,
            nom: t.nom,
            categorie_nom: t.categorie_nom,
            date_add: t.date_add
          }));
          this.isLoading = false;
        },
        error: () => {
          this.templates = [];
          this.isLoading = false;
        }
      });
  }
}
