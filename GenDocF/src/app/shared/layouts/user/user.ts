import { Component } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User {

}
