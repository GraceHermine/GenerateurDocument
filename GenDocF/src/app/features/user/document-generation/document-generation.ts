// document-generation.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentGenereService } from '../../../core/services/document-genere.service';
import { TemplateService } from '../../../core/services/template.service';
import { ReponseService } from '../../../core/services/reponse.service';
import { DocumentGenere } from '../../../core/models/document.model';

@Component({
  selector: 'app-document-generation',
  imports: [CommonModule, RouterModule],
  templateUrl: './document-generation.html',
  styleUrl: './document-generation.scss',
})
export class DocumentGeneration implements OnInit {
  generatedDocumentId: number | null = null;
  isGenerating = false;
  today = new Date();

  // GETTERS pour le template
  get documentVersion(): string {
    return '1.0';
  }

  get documentTitle(): string {
    return 'Document Généré';
  }

  get documentFileSize(): string {
    return '2.4 Mo';
  }

  get documentStatus(): string {
    return 'finalise';
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentGenereService,
    private templateService: TemplateService,
    private reponseService: ReponseService
  ) {}

  ngOnInit(): void {
    this.generateDocument();
  }

  generateDocument(): void {
    this.isGenerating = true;
    
    const templateId = this.route.snapshot.queryParamMap.get('template');
    
    if (templateId) {
      const newDocument: Partial<DocumentGenere> = {
        template: Number(templateId),
        titre: 'Nouveau Document Généré',
        statut: 'finalise',
        contenu_final: 'Contenu du document généré...'
      };

      this.documentService.createDocument(newDocument)
        .subscribe({
          next: (document) => {
            this.generatedDocumentId = document.id;
            this.isGenerating = false;
          },
          error: (error) => {
            console.error('Erreur:', error);
            this.isGenerating = false;
          }
        });
    } else {
      console.error('Aucun template ID trouvé dans l\'URL');
      this.isGenerating = false;
    }
  }

  downloadGeneratedDocument(): void {
    if (this.generatedDocumentId) {
      this.documentService.downloadDocument(this.generatedDocumentId)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document-genere.pdf';
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error('Erreur:', error);
          }
        });
    }
  }

  generateAnother(): void {
    this.router.navigate(['/templates']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToHistory(): void {
    this.router.navigate(['/documents']);
  }

  goToTemplates(): void {
    this.router.navigate(['/templates']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'brouillon': return 'bg-yellow-100 text-yellow-800';
      case 'finalise': return 'bg-green-100 text-green-800';
      case 'archive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'finalise': return 'Finalisé';
      case 'archive': return 'Archivé';
      default: return status;
    }
  }
}