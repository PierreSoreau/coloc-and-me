import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-button-update',
  imports: [],
  templateUrl: './button-update.html',
  styleUrl: './button-update.scss',
})
export class ButtonUpdate {

  @Output() clickUpdate = new EventEmitter<void>()
}
