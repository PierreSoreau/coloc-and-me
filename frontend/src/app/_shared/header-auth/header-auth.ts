import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header-auth',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-auth.html',
  styleUrl: './header-auth.scss',
})
export class HeaderAuth { }
