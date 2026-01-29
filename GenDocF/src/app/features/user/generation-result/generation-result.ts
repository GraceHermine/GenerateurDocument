import { Component } from '@angular/core';

@Component({
  selector: 'app-generation-result',
  imports: [],
  templateUrl: './generation-result.html',
  styleUrl: './generation-result.scss',
})
export class GenerationResult {
  
  document = {
    name: 'Facture_2023_04.pdf',
    status: 'Validé', // ou "En attente"
    generatedBy: 'Marc Duboix',
    generatedDate: '12 Octobre 2023',
    client: {
      name: 'Client Immobilier Luxe',
      address: '45 Rue du Faubourg Saint-Honoré, 75008 Paris'
    },
    details: {
      date: '12/10/2023',
      dueDate: '12/11/2023'
    },
    items: [
      { description: 'Audit de Gestion Durable', sub: 'Services de conseil en environnement', amount: 1200 },
      { description: 'Génération de Rapports Automatisés', sub: 'Abonnement Premium DocuWood', amount: 450 }
    ],
    totals: {
      subtotal: 1650,
      tax: 330,
      total: 1980
    },
    file: {
      type: 'PDF / Facture',
      size: '1.2 MB'
    }
  };

  downloadDocument() {
    console.log('Téléchargement du document :', this.document.name);
    // Ici, tu peux appeler un service pour télécharger le PDF
  }

  shareDocument() {
    console.log('Partager le document :', this.document.name);
    // Ici, tu peux générer un lien de partage
  }

  deleteDocument() {
    console.log('Suppression du document :', this.document.name);
    // Ici, tu peux appeler un service pour supprimer le document
  }

}
