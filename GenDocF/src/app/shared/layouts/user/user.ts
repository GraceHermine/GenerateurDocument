import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- 1. Import nécessaire

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule], // <--- 2. Ajout dans la liste des imports
  templateUrl: './user.html',
  styleUrls: ['./user.scss']
})
export class User {
  // Pas besoin de logique complexe ici pour l'instant
}