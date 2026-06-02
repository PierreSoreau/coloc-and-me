import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { passwordMatchValidator } from '../../../_shared/validators/password-match';
import { getConfirmPasswordError, getFieldErrorMessage } from '../../../_shared/utils/forms-error'
import { AuthService } from '../services/auth.services';
import { ButtonBack } from '../../../_shared/button/button-back/button-back';


@Component({
  selector: 'app-reset-password',
  imports: [InputComponent, ButtonRecord, ReactiveFormsModule, ButtonBack],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {

  private authService = inject(AuthService)
  private router = inject(Router)
  //permet de faire un router qui mène à la page précédente
  private location = inject(Location)

  resetForm: FormGroup
  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],

    }, { validators: passwordMatchValidator })
  }

  goBack(): void {
    this.location.back();
  }

  getConfirmPasswordError(): string {
    return getConfirmPasswordError(this.resetForm);
  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.resetForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

  async onSubmit() {
    if (this.resetForm.invalid) {
      return
    }

    const rawData = this.resetForm.value;

    const cleanData = {
      password: rawData.password
    }

    const newPassword = await this.authService.resetPassword(cleanData)

    if (newPassword.data.user) {
      console.log("Mot de passe réinitialisé", newPassword.data)
      this.router.navigate(["/dashboard"])
      return;
    }

    else { console.log("Erreur lors de la réinitialisation du mot de passe", newPassword.error?.message) }

  }






}
