import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,              
  imports: [ RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  constructor(private router: Router) {}

  login(form: any) {
    // Ici tu pourrais valider email/password
    console.log(form);
    // Puis naviguer
    this.router.navigate(['/user']);
  }

}
