import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // AJOUTE CET IMPORT
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentGenereService } from '../../../core/services/document-genere.service';
import { DocumentGenere } from '../../../core/models/document.model';

@Component({
  selector: 'app-document-preview',
  imports: [CommonModule, RouterModule], // AJOUTE CommonModule
  templateUrl: './document-preview.html',
  styleUrl: './document-preview.scss',
})
export class DocumentPreview implements OnInit, OnDestroy {
  document: DocumentGenere | null = null;
  isLoading = true;
  isPdfLoading = false;
  pdfError: string | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  private pdfObjectUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentGenereService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadDocument();
  }

  ngOnDestroy(): void {
    this.revokePdfUrl();
  }

  loadDocument(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.documentService.getDocument(id)
      .subscribe({
        next: (doc) => {
          this.document = doc;
          this.isLoading = false;
          this.loadPdfPreview();
        },
        error: (error) => {
          console.error('Erreur lors du chargement:', error);
          this.isLoading = false;
        }
      });
  }

  loadPdfPreview(): void {
    if (!this.document) {
      return;
    }

    this.isPdfLoading = true;
    this.pdfError = null;
    this.revokePdfUrl();

    this.documentService.downloadDocument(this.document.id)
      .subscribe({
        next: (blob) => {
          this.pdfObjectUrl = window.URL.createObjectURL(blob);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfObjectUrl);
          this.isPdfLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du PDF:', error);
          this.pdfError = 'Impossible de charger le PDF.';
          this.isPdfLoading = false;
        }
      });
  }

  private revokePdfUrl(): void {
    if (this.pdfObjectUrl) {
      window.URL.revokeObjectURL(this.pdfObjectUrl);
      this.pdfObjectUrl = null;
    }
    this.pdfUrl = null;
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