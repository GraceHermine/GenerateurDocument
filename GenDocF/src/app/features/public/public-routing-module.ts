import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Public } from '../../shared/layouts/public/public';
import { Home } from './home/home';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { Faq } from './faq/faq';
import { Guide } from './guide/guide';
import { Help } from './help/help';
import { TemplatesList } from '../user/templates-list/templates-list';
import { DocumentGeneration } from '../user/document-generation/document-generation';
import { CategoriesComponent } from './public/categories/categories.component';
import { DynamicForm } from '@features/user/dynamic-form/dynamic-form';

const routes: Routes = [
  {
    path: '',
    component: Public,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'templates', component: TemplatesList },
      { path: 'document-generation', component: DocumentGeneration },
      { path: 'about', component: About },
      { path: 'contact', component: Contact },
      { path: 'faq', component: Faq },
      { path: 'guide', component: Guide },
      { path: 'help', component: Help },
      { path: 'categories', component: CategoriesComponent },
      { path: 'dynamic-form', component: DynamicForm },
      { path: 'dynamic-form/:id', component: DynamicForm },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
