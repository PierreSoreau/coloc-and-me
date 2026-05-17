import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class InputComponent {
  @Input() labelText:string = '';
  @Input() srcAssetInput:string = '';
  @Input() altAssetInput:string = '';
  @Input() inputType:string = 'text';
  @Input() placeholderText:string = '';




}
