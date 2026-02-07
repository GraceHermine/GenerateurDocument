import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Indispensable pour *ngFor et DatePipe
import { DocumentService } from '../../../core/services/document.service';
import { DocumentHistory } from '../../../core/models/document.model';

@Component({
  selector: 'app-history',
  standalone: true,
  // ✅ On importe CommonModule pour pouvoir utiliser les boucles et les dates dans le HTML
  imports: [CommonModule], 
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  
  // La liste qui va contenir tes documents
  documents: DocumentHistory[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private documentService: DocumentService) {}

  // Cette fonction se lance automatiquement au chargement de la page
  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.documentService.getUserDocuments().subscribe({
      next: (data) => {
        console.log('Documents reçus :', data); // Pour le débogage
        this.documents = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur API :', err);
        this.errorMessage = "Impossible de charger l'historique.";
        this.isLoading = false;
      }
    });
  }

  // Fonction appelée quand on clique sur le bouton "Télécharger"
  onDownload(doc: DocumentHistory): void {
    // Si le document n'est pas fini (status != 'done'), on ne fait rien
    // Note: ton modèle dit 'done', vérifie si le back renvoie 'completed' ou 'done'. 
    // Dans le doute, on laisse l'utilisateur cliquer.
    
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        // Astuce pour déclencher le téléchargement du fichier reçu
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // On donne un nom par défaut au fichier
        link.download = `${doc.template_nom}_${doc.date_generation}.${doc.format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement', err);
        alert("Erreur lors du téléchargement du fichier.");
      }
    });
  }
}