import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './public.html',
  styleUrl: './public.scss',
})
export class Public {

}
