import { Component, Output, EventEmitter, inject } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-button-back',
  imports: [],
  templateUrl: './button-back.html',
  styleUrl: './button-back.scss',
})
export class ButtonBack {

  private location = inject(Location)
  goBack() {
    //Fait exactement comme la flèche retour du navigateur !
    this.location.back();
  }

}
