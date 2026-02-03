import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

interface DocumentGenere {
  id: number;
  template: number;
  template_nom: string;
  categorie_nom?: string;
  categorie_id?: number;
  format: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  date_generation: string;
  fichier: string | null;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api';

  documents: DocumentGenere[] = [];
  filteredDocuments: DocumentGenere[] = [];
  categories: string[] = [];
  currentCategory: string = 'Tous';
  isLoading = true;

  ngOnInit() {
    this.fetchDocuments();
  }

  fetchDocuments() {
    this.isLoading = true;
    this.http.get<DocumentGenere[]>(`${this.apiUrl}/documents/`).subscribe({
      next: (data) => {
        this.documents = data;
        this.filteredDocuments = data;
        this.extractCategories();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des documents', err);
        this.isLoading = false;
      }
    });
  }

  extractCategories() {
    const cats = new Set<string>();
    this.documents.forEach(doc => {
      if (doc.categorie_nom) {
        cats.add(doc.categorie_nom);
      }
    });
    this.categories = Array.from(cats).sort();
  }

  filterByCategory(category: string) {
    this.currentCategory = category;
    if (category === 'Tous') {
      this.filteredDocuments = this.documents;
    } else {
      this.filteredDocuments = this.documents.filter(doc => doc.categorie_nom === category);
    }
  }

  downloadDocument(doc: DocumentGenere) {
    if (doc.status !== 'done') {
      return;
    }
    // Ouvre le lien de téléchargement dans un nouvel onglet
    window.open(`${this.apiUrl}/documents/${doc.id}/download/`, '_blank');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
  
  getStatusLabel(status: string): string {
     switch (status) {
      case 'done': return 'Terminé';
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      case 'error': return 'Erreur';
      default: return status;
    }
  }
}
