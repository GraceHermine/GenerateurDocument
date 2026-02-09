import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TemplateService } from '../../../core/services/template.service';
import { CategorieService } from '../../../core/services/categorie.service';
import { TemplateDocument, CategorieTemplate } from '../../../core/models/document.model';

@Component({
  selector: 'app-templates-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './templates-list.html',
  styleUrl: './templates-list.scss',
})
export class TemplatesList implements OnInit {
  allTemplates: TemplateDocument[] = [];
  displayedTemplates: TemplateDocument[] = [];
  categories: CategorieTemplate[] = [];
  selectedCategoryId: number | null = null;
  isLoading = true;

  constructor(
    private templateService: TemplateService,
    private categorieService: CategorieService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Charger les catégories en premier pour les badges
    this.categorieService.getAllCategories().subscribe({
      next: (response: any) => {
        // Extraction sécurisée si l'API catégories est aussi paginée
        this.categories = response.results || (Array.isArray(response) ? response : []);
        // 2. Charger les templates
        this.loadTemplates();
      },
      error: (err) => {
        console.error('Erreur catégories:', err);
        this.loadTemplates();
      }
    });
  }

  loadTemplates(): void {
    this.templateService.getAllTemplates().subscribe({
      next: (response: any) => {
        // Extraction du format Django { count, next, previous, results: [] }
        if (response && response.results) {
          this.allTemplates = response.results;
        } else {
          this.allTemplates = Array.isArray(response) ? response : [];
        }
        
        // Gestion des paramètres de l'URL pour le filtrage
        this.route.params.subscribe(params => {
          const catId = params['category'];
          this.selectedCategoryId = catId ? Number(catId) : null;
          this.applyFilter();
        });
      },
      error: (err) => {
        console.error('Erreur templates:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.selectedCategoryId !== null) {
      this.displayedTemplates = this.allTemplates.filter(
        t => Number(t.categorie) === this.selectedCategoryId
      );
    } else {
      this.displayedTemplates = [...this.allTemplates];
    }
    this.isLoading = false; // Arrêt impératif du loader pour afficher le HTML
  }

  filterByCategory(categoryId: number | null): void {
    if (categoryId) {
      this.router.navigate(['/templates', { category: categoryId }]);
    } else {
      this.router.navigate(['/templates']);
    }
  }

  getTemplatesByCategory(categoryId: number): TemplateDocument[] {
    return this.allTemplates.filter(t => Number(t.categorie) === categoryId);
  }
}