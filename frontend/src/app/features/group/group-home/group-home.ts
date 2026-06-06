import { Component } from '@angular/core';
import { Redirection } from '../../../_shared/button/redirection/redirection';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-group-home',
  imports: [Redirection, RouterLink],
  templateUrl: './group-home.html',
  styleUrl: './group-home.scss',
})
export class GroupHome { }
