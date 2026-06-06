import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-dynamique',
  imports: [ReactiveFormsModule],
  templateUrl: './input-dynamique.html',
  styleUrl: './input-dynamique.scss',
})
export class InputDynamique {
  @Input() labelText: string = '';
  @Input() srcAssetInput: string = '';
  @Input() altAssetInput: string = '';
  @Input() inputType: string = 'text';
  @Input() placeholderText: string = '';
  @Input() errorMessage: string = '';
  //le point d'exclamation permet de dire je déclarerais plus tard la variable
  @Input() control!: FormControl;
  @Input() form!: FormGroup;
}
