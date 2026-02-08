// templates-list.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TemplateService } from '../../../core/services/template.service';
import { CategorieService } from '../../../core/services/categorie.service';
import { TemplateDocument, CategorieTemplate } from '../../../core/models/document.model';

@Component({
  selector: 'app-templates-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './templates-list.html',
  styleUrl: './templates-list.scss',
})
export class TemplatesList implements OnInit {
  templates: TemplateDocument[] = [];
  categories: CategorieTemplate[] = [];
  selectedCategoryId: number | null = null;
  isLoading = true;

  constructor(
    private templateService: TemplateService,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.loadCategories();
  }

  loadTemplates(): void {
    this.isLoading = true;
    
    if (this.selectedCategoryId) {
      this.templateService.getTemplatesByCategorie(this.selectedCategoryId)
        .subscribe({
          next: (templates) => {
            this.templates = templates;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Erreur:', error);
            this.isLoading = false;
          }
        });
    } else {
      this.templateService.getAllTemplates()
        .subscribe({
          next: (templates) => {
            this.templates = templates;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Erreur:', error);
            this.isLoading = false;
          }
        });
    }
  }

  loadCategories(): void {
    this.categorieService.getAllCategories()
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.loadTemplates();
  }

  getTemplatesByCategory(categoryId: number): TemplateDocument[] {
    return this.templates.filter(template => template.categorie === categoryId);
  }

  // AJOUTE CETTE MÉTHODE MANQUANTE
  getCategoryName(categoryId: number): string {
    if (!categoryId) return 'Non catégorisé';
    
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.nom || `Catégorie ${categoryId}`;
  }

  // Optionnel : Méthode pour obtenir le nombre de templates par catégorie
  getTemplateCountByCategory(categoryId: number): number {
    return this.templates.filter(template => template.categorie === categoryId).length;
  }

  // Optionnel : Méthode pour formater la date
  formatDate(dateString?: string): string {
    if (!dateString) return 'Date non disponible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}