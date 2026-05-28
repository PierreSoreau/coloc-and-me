import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button-back',
  imports: [],
  templateUrl: './button-back.html',
  styleUrl: './button-back.scss',
})
export class ButtonBack {
  @Output() clickBack = new EventEmitter<void>();

  clickOutputBack(): void {
    this.clickBack.emit();
  }

}
