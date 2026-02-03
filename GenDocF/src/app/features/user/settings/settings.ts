import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Indispensable pour [(ngModel)]

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html', 
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit {

  // Onglet actif par défaut
  activeTab: string = 'theme'; 

  // Toutes les données de ta page sont stockées ici
  preferences = {
    language: 'Français (France)',
    dateFormat: 'JJ/MM/AAAA',
    theme: 'light', // 'light', 'dark', 'system'
    notifications: {
      weeklyReport: true,
      securityAlerts: true,
      news: false
    }
  };

  constructor() { }

  ngOnInit(): void {
    // Applique le thème enregistré au chargement de la page
    this.applyTheme(this.preferences.theme);
  }

  // Change l'onglet actif (Menu du haut)
  switchTab(tabName: string): void {
    this.activeTab = tabName;
  }

  // Change le thème visuel
  setTheme(themeName: string): void {
    this.preferences.theme = themeName;
    this.applyTheme(themeName);
  }

  // Logique technique pour ajouter la classe "dark" au HTML
  private applyTheme(theme: string): void {
    const htmlElement = document.documentElement;
    
    // Si thème sombre, on ajoute la classe. Sinon on l'enlève.
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else if (theme === 'light') {
      htmlElement.classList.remove('dark');
    } else {
      // Gestion basique du mode système (optionnel)
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? htmlElement.classList.add('dark') : htmlElement.classList.remove('dark');
    }
  }

  // Action du bouton "Enregistrer"
  saveSettings(): void {
    console.log('Données envoyées au Backend :', this.preferences);
    alert('Vos préférences ont été enregistrées avec succès !');
  }
  
  // Action du bouton "Annuler"
  cancel(): void {
    alert('Modifications annulées.');
    // Ici on pourrait recharger les données originales depuis le serveur
  }
}