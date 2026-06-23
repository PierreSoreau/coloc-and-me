import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-button-delete',
  imports: [],
  templateUrl: './button-delete.html',
  styleUrl: './button-delete.scss',
})
export class ButtonDelete {

  @Output() clickDelete = new EventEmitter<void>()
  @Input() deleteText: string = ""
}

