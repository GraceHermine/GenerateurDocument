import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  categories = [
    {
      title: 'Attestations & Déclarations',
      description: 'Attestation sur l’honneur, hébergement, domicile, etc.',
      icon: 'description',
      slug: 'attestations'
    },
    {
      title: 'Résiliations & Contrats',
      description: 'Assurance, abonnement, logement, services.',
      icon: 'assignment_return',
      slug: 'contrats'
    },
    {
      title: 'Réclamations & Litiges',
      description: 'Courriers de plainte, contestation et mise en demeure.',
      icon: 'gavel',
      slug: 'litiges'
    },
    {
      title: 'Travail & Études',
      description: 'Demande de stage, congé, attestation employeur.',
      icon: 'school',
      slug: 'travail-etudes'
    },
    {
      title: 'Vie quotidienne',
      description: 'Courriers administratifs et démarches personnelles.',
      icon: 'home',
      slug: 'vie-quotidienne'
    },
    {
      title: 'Autres documents',
      description: 'Modèles personnalisables selon vos besoins.',
      icon: 'folder',
      slug: 'autres'
    }
  ];

}
