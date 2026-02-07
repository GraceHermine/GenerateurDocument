import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/documents';

  categories: Array<{ title: string; slug: string | number; description?: string; icon?: string }> = [];

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.http
      .get<any>(`${this.apiUrl}/categories/`)
      .pipe(map((resp) => (Array.isArray(resp) ? resp : (resp?.results ?? []))))
      .subscribe({
        next: (items: any[]) => {
          if (!items || items.length === 0) {
            this.categories = this.defaultCategories();
          } else {
            this.categories = items.map((c) => ({
              title: c.nom,
              slug: c.id,
              description: c.description,
              icon: c.icone || 'folder'
            }));
          }
        },
        error: () => {
          this.categories = this.defaultCategories();
        }
      });
  }

  private defaultCategories() {
    return [
      { title: 'Attestations et Déclarations', slug: 'attestations-declarations', description: 'Attestation sur l’honneur, hébergement, domicile', icon: 'description' },
      { title: 'Résiliations et Contrats', slug: 'resiliations-contrats', description: 'Assurance, abonnement, logement, services', icon: 'assignment_return' },
      { title: 'Réclamations et Litiges', slug: 'reclamations-litiges', description: 'Plainte, contestation, mise en demeure', icon: 'gavel' },
      { title: 'Travail et Études', slug: 'travail-et-etudes', description: 'Stage, congé, attestation employeur', icon: 'school' },
      { title: 'Vie quotidienne', slug: 'vie-quotidienne', description: 'Courriers administratifs et démarches', icon: 'home' }
    ];
  }

}
