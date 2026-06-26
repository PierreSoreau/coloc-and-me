import { Component } from '@angular/core';
import { HeaderIntroduction } from '../../_shared/header-introduction/header-introduction';
import { Footer } from '../../_shared/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-introductionlayout',
  imports: [HeaderIntroduction, Footer, RouterOutlet],
  templateUrl: './introductionlayout.html',
  styleUrl: './introductionlayout.scss',
})
export class Introductionlayout { }
