import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategorieTemplate } from '@core/models/document.model';
import { CategorieService } from '../../../core/services/categorie.service';
import { TemplateService } from '../../../core/services/template.service';

@Component({
  selector: 'app-template-create',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './template-create.html',
  styleUrl: './template-create.scss',
})
export class TemplateCreate {
    categories: CategorieTemplate[] = [];
    selectedCategoryId: number | null = null;
    templateName: string = '';
    templateContent: string = '';
    isLoading = true;
    isSaving = false;
    isDragging = false;
    selectedFile: File | null = null;
    
    constructor(
      private categorieService: CategorieService,
      private templateService: TemplateService,
      private route: ActivatedRoute,
      private router: Router,
      private cdr: ChangeDetectorRef
    ) {}

    onDragOver(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = true;
    }
  
    onDragLeave(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
    }
  
    onDrop(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
      
      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        this.processFile(event.dataTransfer.files[0]);
      }
    }

    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.processFile(file);
      }
    }

    processFile(file: File) {
      const extension = file.name.split('.').pop()?.toLowerCase();
    
      if (['docx', 'txt', 'md', 'html'].includes(extension || '')) {
        this.selectedFile = file;
        this.templateContent = `[Import] Fichier sélectionné : ${file.name}`;
      } else {
        alert('Format non supporté. Utilisez .txt, .md, .html ou .docx');
      }
    }
    
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

    saveTemplate(): void {
      if (!this.templateName.trim()) {
        alert('Veuillez saisir un nom pour le template.');
        return;
      }
      if (!this.selectedCategoryId) {
        alert('Veuillez sélectionner une catégorie.');
        return;
      }
      if (!this.selectedFile && !this.templateContent.trim()) {
        alert('Veuillez importer un fichier ou saisir un contenu.');
        return;
      }

      this.isSaving = true;

      // Si pas de fichier uploadé, créer un fichier texte à partir du contenu saisi
      const fichier = this.selectedFile
        ? this.selectedFile
        : new File([this.templateContent], `${this.templateName.trim()}.txt`, { type: 'text/plain' });

      this.templateService.createTemplate({
        nom: this.templateName.trim(),
        categorie: this.selectedCategoryId,
        fichier: fichier
      }).subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(['/user/templates-list']);
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Erreur création template:', err);
          alert('Erreur lors de la création du template.');
        }
      });
    }
}
