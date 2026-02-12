// document.ts
import { Component, OnInit ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DocumentGenereService } from '../../../core/services/document-genere.service';
import { CategorieService } from '../../../core/services/categorie.service';
import { TemplateService } from '../../../core/services/template.service';
import { DocumentHistory, CategorieTemplate, TemplateDocument } from '../../../core/models/document.model';

@Component({
  selector: 'app-document',
  imports: [CommonModule, RouterModule],
  templateUrl: './document.html',
  styleUrl: './document.scss',
})
export class Document implements OnInit {
  documents: DocumentHistory[] = [];
  categories: CategorieTemplate[] = [];
  templates: TemplateDocument[] = [];
  isLoading = true;

  // Filtres
  statusFilter: string = '';

  constructor(
    private documentService: DocumentGenereService,
    private categorieService: CategorieService,
    private templateService: TemplateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Charger l'historique des documents de l'utilisateur
    this.documentService.getUserHistory()
      .subscribe({
        next: (documents) => {
          this.documents = documents;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur chargement historique:', error);
          this.isLoading = false;
        }
      });

    // Charger les catégories
    this.categorieService.getAllCategories()
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.cdr.detectChanges();
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
  }

  // Documents filtrés
  get filteredDocuments(): DocumentHistory[] {
    if (!this.statusFilter) return this.documents;
    return this.documents.filter(doc => doc.status === this.statusFilter);
  }

  // Télécharger un document
  downloadDocument(doc: DocumentHistory): void {
    if (doc.fichier) {
      // Télécharger via l'URL du fichier
      window.open(doc.fichier, '_blank');
    } else {
      // Fallback : télécharger via l'endpoint de download
      this.documentService.downloadDocument(doc.id)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${doc.template_nom}.${doc.format || 'docx'}`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error('Erreur téléchargement:', error);
          }
        });
    }
  }

  // Supprimer un document
  deleteDocument(id: number): void {
    if (confirm('Supprimer définitivement ce document ?')) {
      this.documentService.deleteDocument(id)
        .subscribe({
          next: () => {
            this.documents = this.documents.filter(doc => doc.id !== id);
          },
          error: (error) => {
            console.error('Erreur suppression:', error);
          }
        });
    }
  }

  // Badge de statut
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'done':
      case 'completed': return 'badge-success';
      case 'processing':
      case 'pending': return 'badge-warning';
      case 'error': return 'badge-error';
      default: return 'badge-default';
    }
  }

  // Texte de statut
  getStatusText(status: string): string {
    switch (status) {
      case 'done':
      case 'completed': return 'Terminé';
      case 'processing': return 'En cours';
      case 'pending': return 'En attente';
      case 'error': return 'Erreur';
      default: return status;
    }
  }
}