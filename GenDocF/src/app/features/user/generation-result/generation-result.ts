// generation-result.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentGenereService } from '../../../core/services/document-genere.service';
import { DocumentGenere } from '../../../core/models/document.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generation-result',
  imports: [CommonModule], 
  templateUrl: './generation-result.html',
  styleUrl: './generation-result.scss',
})
export class GenerationResult implements OnInit {
  document: DocumentGenere | null = null;
  zoom = 100;
  showShareModal = false;
  shareLink = '';

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentGenereService
  ) {}

  ngOnInit(): void {
    this.loadDocument();
    this.generateShareLink();
  }

  loadDocument(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.documentService.getDocument(id)
      .subscribe({
        next: (doc) => {
          this.document = doc;
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });
  }

  generateShareLink(): void {
    const baseUrl = window.location.origin;
    const documentId = this.route.snapshot.paramMap.get('id');
    this.shareLink = `${baseUrl}/share/document/${documentId}`;
  }

  // Getters pour le template
  get responseCount(): number {
    return this.document?.reponses?.length || 0;
  }

  get wordCount(): number {
    if (!this.document?.contenu_final) return 0;
    return this.document.contenu_final.split(/\s+/).length;
  }

  get documentTitle(): string {
    return this.document?.titre || 'Document';
  }

  get documentStatus(): string {
    return this.document?.statut || 'inconnu';
  }

  get createdDate(): string {
    return this.document?.created_at || '';
  }

  get updatedDate(): string {
    return this.document?.updated_at || '';
  }

  get templateName(): string {
    return this.document?.template_details?.nom || 
           this.document?.template?.toString() || 
           'Template inconnu';
  }

  get formulaireName(): string {
    return this.document?.formulaire_details?.titre || 'Non spécifié';
  }

  get categoryName(): string {
    return this.document?.template_details?.categorie_details?.nom || 'Général';
  }

  // Méthodes d'action
  copyShareLink(): void {
    navigator.clipboard.writeText(this.shareLink)
      .then(() => {
        alert('Lien copié dans le presse-papier !');
      })
      .catch(err => {
        console.error('Erreur lors de la copie : ', err);
        alert('Erreur lors de la copie du lien');
      });
  }

  shareDocument(): void {
    this.showShareModal = true;
  }

  downloadDocument(): void {
    if (this.document) {
      this.documentService.downloadDocument(this.document.id)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.document?.titre}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error('Erreur:', error);
          }
        });
    }
  }

  renameDocument(): void {
    if (this.document) {
      const newName = prompt('Nouveau nom:', this.document.titre);
      if (newName && newName.trim() !== '') {
        this.documentService.updateDocument(this.document.id, { 
          titre: newName.trim() 
        })
        .subscribe({
          next: (updatedDoc) => {
            this.document = updatedDoc;
            alert('Document renommé');
          },
          error: (error) => {
            console.error('Erreur:', error);
          }
        });
      }
    }
  }

  archiveDocument(): void {
    if (this.document && confirm('Archiver ce document ?')) {
      this.documentService.archiverDocument(this.document.id)
        .subscribe({
          next: (updatedDoc) => {
            this.document = updatedDoc;
            alert('Document archivé');
          },
          error: (error) => {
            console.error('Erreur:', error);
          }
        });
    }
  }

  restoreDocument(): void {
    if (this.document && confirm('Restaurer ce document ?')) {
      alert('Fonctionnalité à implémenter');
    }
  }

  duplicateDocument(): void {
    if (this.document && confirm('Dupliquer ce document ?')) {
      const duplicatedDoc = {
        ...this.document,
        titre: `${this.document.titre} - Copie`,
        id: undefined
      };
      
      this.documentService.createDocument(duplicatedDoc)
        .subscribe({
          next: (newDoc) => {
            alert('Document dupliqué avec succès');
          },
          error: (error) => {
            console.error('Erreur:', error);
          }
        });
    }
  }

  deleteDocument(): void {
    if (this.document && confirm('Supprimer ce document ?')) {
      this.documentService.deleteDocument(this.document.id)
        .subscribe({
          next: () => {
            alert('Document supprimé');
            window.history.back();
          },
          error: (error) => {
            console.error('Erreur:', error);
          }
        });
    }
  }

  zoomIn(): void {
    this.zoom = Math.min(this.zoom + 25, 200);
  }

  zoomOut(): void {
    this.zoom = Math.max(this.zoom - 25, 50);
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

  // generation-result.ts - Ajoute ces getters
  // getresponseCount(): number {
  //   return this.document?.reponses?.length || 0;
  // }

  // getwordCount(): number {
  //   if (!this.document?.contenu_final) return 0;
  //   return this.document.contenu_final.split(/\s+/).length;
  // }

  closeShareModal(): void {
    this.showShareModal = false;
  }
}