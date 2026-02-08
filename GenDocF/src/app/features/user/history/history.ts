import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentHistory } from '../../../core/models/document.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  
  documents: DocumentHistory[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef // Indispensable pour rafraîchir l'écran
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.documentService.getUserDocuments().subscribe({
      next: (data) => {
        console.log('✅ Documents reçus :', data);
        this.documents = data;
        this.isLoading = false;
        
        // Force la mise à jour de l'écran (Fin du chargement)
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('❌ Erreur API :', err);
        this.errorMessage = "Impossible de récupérer votre historique.";
        this.isLoading = false;
        
        // Force la mise à jour de l'écran (Affichage erreur)
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ C'EST ICI LA CORRECTION POUR L'OEIL 👁️
  onPreview(doc: DocumentHistory): void {
    if (!doc.fichier) return;

    // Si ce n'est pas un PDF, on force le téléchargement car le navigateur ne pourra pas l'afficher
    if (doc.format && doc.format.toLowerCase() !== 'pdf') {
      this.onDownload(doc);
      return;
    }

    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        // 👇 ETAPE CRUCIALE : On crée un nouveau Blob en forçant le type 'application/pdf'
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        
        // On crée l'URL pour ce PDF
        const fileURL = window.URL.createObjectURL(pdfBlob);
        
        // On l'ouvre dans un nouvel onglet
        window.open(fileURL, '_blank');
      },
      error: (err) => {
        console.error('Erreur visualisation', err);
        alert("Impossible d'ouvrir le document.");
      }
    });
  }

  // Fonction pour le bouton Télécharger (Flèche)
  onDownload(doc: DocumentHistory): void {
    if (!doc.fichier) return;
    
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // On donne un joli nom au fichier téléchargé
        link.download = `${doc.template_nom}_${doc.id}.${doc.format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement', err);
        alert("Le fichier semble introuvable sur le serveur.");
      }
    });
  }
}