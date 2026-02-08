import { Component, OnInit } from '@angular/core';
import { CategorieService } from '../../../../shared/services/categorie'; // chemin corrigé
import { Categorie } from '../../../../shared/models/categorie'; // chemin corrigé
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Categorie[] = [];

  constructor(private categorieService: CategorieService) {}

  ngOnInit(): void {
    this.categorieService.getCategories().subscribe({
      next: (data: Categorie[]) => { // type précisé
        this.categories = data;
        console.log('Catégories reçues :', data);
      },
      error: (err: any) => console.error('Erreur API :', err) // type précisé
    });
  }
}
