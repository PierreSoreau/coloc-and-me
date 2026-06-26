import { Component } from '@angular/core';
import { Header } from '../../_shared/header/header';
import { Footer } from '../../_shared/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-mainlayout',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './mainlayout.html',
  styleUrl: './mainlayout.scss',
})
export class Mainlayout { }
