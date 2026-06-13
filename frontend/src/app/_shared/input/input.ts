import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule],
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class InputComponent {
  @Input() labelText: string = '';
  @Input() srcAssetInput: string = '';
  @Input() altAssetInput: string = '';
  @Input() inputType: string = 'text';
  @Input() placeholderText: string = '';
  @Input() errorMessage: string = '';
  @Input() controlName: string = "";
  @Input() form!: FormGroup;
  @Input() showLogo: boolean = true;





}
