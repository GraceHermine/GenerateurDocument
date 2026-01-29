import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicRoutingModule } from './public-routing-module';

// Importez vos composants standalone
import { Public } from '../../shared/layouts/public/public';
import { Home } from './home/home';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { Help } from './help/help';
import { Faq } from './faq/faq';
import { Guide } from './guide/guide';

@NgModule({
  imports: [
    CommonModule,
    PublicRoutingModule,
    // On les met ici car ils sont Standalone !
    Public, Home, About, Contact, Help, Faq, Guide 
  ]
})
export class PublicModule { }
