import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Public } from '../../shared/layouts/public/public';
import { Home } from './home/home';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { Help } from './help/help';
import { Faq } from './faq/faq';
import { Guide } from './guide/guide';

const routes: Routes = [
  { path: '', component: Public, children: [
      { path: '', component: Home },
      { path: 'about', component: About },
      { path: 'contact', component: Contact },
      { path: 'help', component: Help },
      { path: 'faq', component: Faq },
      { path: 'guide', component: Guide },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
