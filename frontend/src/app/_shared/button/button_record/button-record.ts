import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-record',
  imports: [],
  templateUrl: './button-record.html',
  styleUrl: './button-record.scss',
})
export class ButtonRecord {
  @Input() buttonText: string = ""
}
