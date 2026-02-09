import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategorieService } from '../../../core/services/categorie.service';
import { CategorieTemplate } from '../../../core/models/document.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  categories: CategorieTemplate[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private categorieService: CategorieService,
    private cdr: ChangeDetectorRef // Ajouté pour forcer le rafraîchissement de la vue
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.categorieService.getAllCategories().subscribe({
      next: (response: CategorieTemplate[]) => {
        this.categories = response;
        this.isLoading = false;
        
        // Force Angular à détecter les changements suite au bug d'hydratation SSR
        this.cdr.detectChanges(); 
        
        console.log(`✅ ${this.categories.length} catégories chargées`);
      },
      error: (error: Error) => {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        this.errorMessage = error.message || 'Une erreur est survenue lors de la récupération des données.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}