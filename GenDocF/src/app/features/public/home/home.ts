import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {

  categories = [
    {
      title: 'Attestations & Déclarations',
      slug: 'attestations-declarations',
      description: 'Attestation sur l’honneur, hébergement, domicile, etc.',
      icon: 'description'
    },
    {
      title: 'Résiliations & Contrats',
      slug: 'resiliations-contrats',
      description: 'Assurance, abonnement, logement, services.',
      icon: 'assignment_return'
    },
    {
      title: 'Réclamations & Litiges',
      slug: 'reclamations-litiges',
      description: 'Courriers de plainte, contestation et mise en demeure.',
      icon: 'gavel'
    },
    {
      title: 'Travail & Études',
      slug: 'travail-et-etudes',
      description: 'Demande de stage, congé, attestation employeur.',
      icon: 'school'
    },
    {
      title: 'Vie quotidienne',
      slug: 'vie-quotidienne',
      description: 'Courriers administratifs et démarches personnelles.',
      icon: 'home'
    },
    {
      title: 'Autres documents',
      slug: 'autres',
      description: 'Modèles personnalisables selon vos besoins.',
      icon: 'folder'
    }
  ];

}
