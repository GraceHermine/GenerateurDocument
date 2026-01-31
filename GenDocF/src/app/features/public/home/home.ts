import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  categories = [
    {
      title: 'Attestations & Déclarations',
      description: 'Attestation sur l’honneur, hébergement, domicile, etc.',
      icon: 'description'
    },
    {
      title: 'Résiliations & Contrats',
      description: 'Assurance, abonnement, logement, services.',
      icon: 'assignment_return'
    },
    {
      title: 'Réclamations & Litiges',
      description: 'Courriers de plainte, contestation et mise en demeure.',
      icon: 'gavel'
    },
    {
      title: 'Travail & Études',
      description: 'Demande de stage, congé, attestation employeur.',
      icon: 'school'
    },
    {
      title: 'Vie quotidienne',
      description: 'Courriers administratifs et démarches personnelles.',
      icon: 'home'
    },
    {
      title: 'Autres documents',
      description: 'Modèles personnalisables selon vos besoins.',
      icon: 'folder'
    }
  ];

}
