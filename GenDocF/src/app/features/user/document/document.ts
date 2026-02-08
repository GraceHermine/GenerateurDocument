// document.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DocumentGenereService } from '../../../core/services/document-genere.service';
import { CategorieService } from '../../../core/services/categorie.service';
import { TemplateService } from '../../../core/services/template.service';
import { DocumentGenere, CategorieTemplate, TemplateDocument } from '../../../core/models/document.model';

@Component({
  selector: 'app-document',
  imports: [CommonModule, RouterModule],
  templateUrl: './document.html',
  styleUrl: './document.scss',
})
export class Document implements OnInit {
  documents: DocumentGenere[] = [];
  categories: CategorieTemplate[] = [];
  templates: TemplateDocument[] = [];
  currentPage = 1;
  totalDocuments = 0;
  itemsPerPage = 10;
  selectedStatus: string = '';
  isLoading = true;

  // Filtres
  statusFilter: string = '';
  categoryFilter: number | null = null;
  dateFilter: { start: string, end: string } = { start: '', end: '' };

  constructor(
    private documentService: DocumentGenereService,
    private categorieService: CategorieService,
    private templateService: TemplateService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Charger les documents
    this.documentService.getDocuments(this.currentPage, this.statusFilter)
      .subscribe({
        next: (response) => {
          this.documents = response.results;
          this.totalDocuments = response.count;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.isLoading = false;
        }
      });

    // Charger les catégories
    this.categorieService.getAllCategories()
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });

    // Charger les templates
    this.templateService.getAllTemplates()
      .subscribe({
        next: (templates) => {
          this.templates = templates;
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });
  }

  // Filtrer par statut
  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadData();
  }

  // Filtrer par catégorie
  filterByCategory(categoryId: number | null): void {
    this.categoryFilter = categoryId;
    this.currentPage = 1;
    // Implémenter la logique de filtrage
  }

  // Changer de page
  changePage(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  // Calculer le nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.totalDocuments / this.itemsPerPage);
  }

  // Créer un nouveau document
  createNewDocument(templateId?: number): void {
    const newDocument: Partial<DocumentGenere> = {
      titre: 'Nouveau Document',
      template: templateId || 1,
      statut: 'brouillon', // ✅ Valeur littérale correcte
      contenu_final: '',
      // Ne pas inclure formulaire si non défini
      // formulaire: undefined // Optionnel si l'API l'accepte
    };

    this.documentService.createDocument(newDocument)
      .subscribe({
        next: (document) => {
          console.log('Document créé:', document);
          this.documents.unshift(document);
          this.totalDocuments++;
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });
  }

  // Télécharger un document
  downloadDocument(id: number): void {
    this.documentService.downloadDocument(id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `document-${id}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });
  }

  // Archiver un document
  archiveDocument(id: number): void {
    if (confirm('Archiver ce document ?')) {
      this.documentService.archiverDocument(id)
        .subscribe({
          next: (document) => {
            // Mettre à jour le document dans la liste
            const index = this.documents.findIndex(doc => doc.id === id);
            if (index !== -1) {
              this.documents[index] = document;
            }
          },
          error: (error) => {
            console.error('Erreur:', error);
          }
        });
    }
  }

  finaliserDocument(id: number): void {
    if (confirm('Finaliser ce document ? Il ne pourra plus être modifié.')) {
      this.documentService.finaliserDocument(id)
        .subscribe({
          next: (document) => {
            // Mettre à jour le document dans la liste
            const index = this.documents.findIndex(doc => doc.id === id);
            if (index !== -1) {
              this.documents[index] = document;
            }
            
            // Mettre à jour le statut visuellement
            this.updateDocumentStatus(id, 'finalise');
            
            alert('Document finalisé avec succès');
          },
          error: (error) => {
            console.error('Erreur:', error);
            alert('Erreur lors de la finalisation du document');
          }
        });
    }
  }

  // Méthode utilitaire pour mettre à jour le statut
  updateDocumentStatus(id: number, newStatus: 'brouillon' | 'finalise' | 'archive'): void {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index !== -1) {
      this.documents[index] = {
        ...this.documents[index],
        statut: newStatus
      };
    }
  }

  // Supprimer un document
  deleteDocument(id: number): void {
    if (confirm('Supprimer définitivement ce document ?')) {
      this.documentService.deleteDocument(id)
        .subscribe({
          next: () => {
            // Retirer du tableau
            this.documents = this.documents.filter(doc => doc.id !== id);
            this.totalDocuments--;
          },
          error: (error) => {
            console.error('Erreur:', error);
          }
        });
    }
  }

  // Obtenir le badge de statut
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'brouillon': return 'bg-yellow-100 text-yellow-800';
      case 'finalise': return 'bg-green-100 text-green-800';
      case 'archive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Obtenir le texte du statut
  getStatusText(status: string): string {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'finalise': return 'Finalisé';
      case 'archive': return 'Archivé';
      default: return status;
    }
  }

  // Obtenir le nom du template
  getTemplateName(templateId: number): string {
    const template = this.templates.find(t => t.id === templateId);
    return template?.titre || `Template ${templateId}`;
  }

  // Obtenir les numéros de page
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    
    // Ajuster le début si on est proche de la fin
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Obtenir le nom de la catégorie
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.nom || `Catégorie ${categoryId}`;
  }
}