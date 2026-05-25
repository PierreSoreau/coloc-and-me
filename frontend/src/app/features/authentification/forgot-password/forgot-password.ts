import { ButtonRecord } from './../../../_shared/button/button_record/button-record';
import { Component, inject, OnInit } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { AuthService, LoginCredentials } from '../services/auth.services';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';


@Component({
  selector: 'app-forgot-password',
  imports: [ButtonRecord, InputComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword implements OnInit {
  private forgotPasswordTitle = inject(Title);

  ngOnInit(): void {
    this.forgotPasswordTitle.setTitle('Coloc&Me | Mot de passe oublié')


  }

  forgotPasswordForm: FormGroup

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.forgotPasswordForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

}


