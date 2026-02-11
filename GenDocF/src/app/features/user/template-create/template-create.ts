import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategorieTemplate } from '@core/models/document.model';
import { CategorieService } from '../../../core/services/categorie.service';

@Component({
  selector: 'app-template-create',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './template-create.html',
  styleUrl: './template-create.scss',
})
export class TemplateCreate {
    categories: CategorieTemplate[] = [];
    selectedCategoryId: number | null = null;
    isLoading = true;
    constructor(
      private categorieService: CategorieService,
      private route: ActivatedRoute,
      private router: Router,
      private cdr: ChangeDetectorRef
    ) {}

      ngOnInit(): void {
    // 1. Charger les catégories en premier pour les badges
      this.categorieService.getAllCategories().subscribe({
      next: (response: any) => {
        // Extraction sécurisée si l'API catégories est aussi paginée
        this.categories = response.results || (Array.isArray(response) ? response : []);
      },
      error: (err) => {
        console.error('Erreur catégories:', err);
      }
    });
    }
    
}
