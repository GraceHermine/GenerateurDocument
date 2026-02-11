import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentGenereService } from '../../../core/services/document.service';
import { DocumentHistory } from '../../../core/models/document.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  user: any = null;
  userName: string = 'Utilisateur';
  recentDocuments: Array<{ id: number; titre: string; type: string; date: string }> = [];
  isRecentLoading = true;

  constructor(
    private authService: AuthService,
    private documentService: DocumentGenereService,
    private cdr: ChangeDetectorRef
  ) {}

  
  ngOnInit(): void {
    // On récupère le nom depuis le token via le service
    // Si vous n'avez pas encore de méthode getUserName, on peut extraire le prénom du localStorage
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = {
          prenom: user?.prenom ?? user?.first_name ?? '',
          nom: user?.nom ?? user?.last_name ?? '',
          email: user?.email ?? user?.username ?? ''
        };
        this.userName = this.user.prenom || 'Gilbert';
        this.cdr.detectChanges();
      },
      error: () => {
        this.user = null;
        this.cdr.detectChanges();
      }
    });
    

    this.loadRecentDocuments();
  }

  loadRecentDocuments(): void {
    this.documentService.getRecentDocuments().subscribe({
      next: (docs: DocumentHistory[]) => {
        this.recentDocuments = (docs || []).map((doc) => ({
          id: doc.id,
          titre: doc.template_nom,
          type: doc.format?.toUpperCase() || 'DOC',
          date: doc.date_generation
        }));
        this.isRecentLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isRecentLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}