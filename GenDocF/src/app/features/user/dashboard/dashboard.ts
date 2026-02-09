import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  userName: string = 'Utilisateur';
  // Simulation de données qui viendraient d'un DocumentService plus tard
  recentDocuments = [
    { id: 1, titre: 'Contrat_Partenaire_V2.pdf', type: 'Juridique', date: "Aujourd'hui, 14:30" },
    { id: 2, titre: 'Contrat de bail BANGOLO.pdf', type: 'Juridique', date: 'Hier, 10:15' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // On récupère le nom depuis le token via le service
    // Si vous n'avez pas encore de méthode getUserName, on peut extraire le prénom du localStorage
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    this.userName = user.prenom || 'Gilbert';
  }
}