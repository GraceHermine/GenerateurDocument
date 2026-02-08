import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// CHEMIN CORRECT : depuis ce fichier vers categories.component.ts
import { CategoriesComponent } from './public/categories/categories.component';

const routes: Routes = [
  // Route pour le composant Categories
  { path: 'categories', component: CategoriesComponent },

  // Redirection vers la page par défaut du module public
  { path: '', redirectTo: 'home', pathMatch: 'full' } // page par défaut
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
