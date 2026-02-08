import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // AJOUTE CET IMPORT
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DocumentGenereService } from '../../../core/services/document-genere.service';
import { DocumentGenere } from '../../../core/models/document.model';

@Component({
  selector: 'app-document-preview',
  imports: [CommonModule, RouterModule], // AJOUTE CommonModule
  templateUrl: './document-preview.html',
  styleUrl: './document-preview.scss',
})
export class DocumentPreview implements OnInit {
  document: DocumentGenere | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentGenereService
  ) {}

  ngOnInit(): void {
    this.loadDocument();
  }

  loadDocument(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.documentService.getDocument(id)
      .subscribe({
        next: (doc) => {
          this.document = doc;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement:', error);
          this.isLoading = false;
        }
      });
  }

  // GETTERS
  get documentId(): number {
    return this.document?.id || 0;
  }

  get documentCreatedAt(): string {
    return this.document?.created_at || '';
  }

  get documentStatus(): string {
    return this.document?.statut || '';
  }

  get documentTemplateId(): number {
    return this.document?.template || 0;
  }

  get documentUpdatedAt(): string {
    return this.document?.updated_at || '';
  }

  get documentTitle(): string {
    return this.document?.titre || 'Document';
  }

  get documentContent(): string {
    return this.document?.contenu_final || '';
  }

  get templateName(): string {
    return this.document?.template_details?.nom || 'Template';
  }

  get hasReponses(): boolean {
    return !!(this.document?.reponses && this.document.reponses.length > 0);
  }

  get reponses(): any[] {
    return this.document?.reponses || [];
  }

  // MÉTHODES
  downloadDocument(): void {
    if (this.document) {
      this.documentService.downloadDocument(this.document.id)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.documentTitle}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error('Erreur lors du téléchargement:', error);
          }
        });
    }
  }

  archiverDocument(): void {
    if (this.document && confirm('Archiver ce document ?')) {
      this.documentService.archiverDocument(this.document.id)
        .subscribe({
          next: (updatedDoc) => {
            this.document = updatedDoc;
            alert('Document archivé avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de l\'archivage:', error);
          }
        });
    }
  }

  deleteDocument(): void {
    if (this.document && confirm('Supprimer définitivement ce document ?')) {
      this.documentService.deleteDocument(this.document.id)
        .subscribe({
          next: () => {
            alert('Document supprimé');
            window.history.back();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
          }
        });
    }
  }
}