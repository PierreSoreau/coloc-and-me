import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { passwordMatchValidator } from '../../../_shared/validators/password-match';
import { getFieldErrorMessage, getConfirmPasswordError } from '../../../_shared/utils/forms-error';
import { ProfilService, profilData } from '../services/profil.services';
import { AuthService } from '../../authentification/services/auth.services';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-new-password',
  imports: [InputComponent, ButtonRecord, ReactiveFormsModule, RouterLink],
  templateUrl: './new-password.html',
  styleUrl: './new-password.scss',
})
export class NewPassword {

  wrongForm: string | null = null
  updatePasswordForm: FormGroup
  private router = inject(Router)
  private authService = inject(AuthService)
  private profilService = inject(ProfilService)
  private token: string | null = null
  private location = inject(Location);
  isEmitEmail: boolean = true;
  private changeDetectorRef = inject(ChangeDetectorRef)

  constructor(private fb: FormBuilder) {
    this.updatePasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      confirmNewPassword: ['', [Validators.required]],

    }, { validators: passwordMatchValidator })
  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.updatePasswordForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

  getConfirmPasswordError(): string {
    return getConfirmPasswordError(this.updatePasswordForm);
  }

  toggle(): void {
    this.isEmitEmail = false
    this.changeDetectorRef.detectChanges();

  }

  goBack() {
    //Fait exactement comme la flèche retour du navigateur !
    this.location.back();
  }

  async onSubmit() {

    if (this.updatePasswordForm.invalid) {
      this.wrongForm = "Certains champs sont invalides ou pas renseignés"
      return
    }

    const newPassword = await this.authService.resetPassword({ password: this.updatePasswordForm.get('newPassword')?.value })

    if (newPassword.data.user) {
      this.toggle()
      console.log("Mot de passe modifié, un mail d'information a été envoyé sur la boîte mail")
    }

    else { console.log("Erreur lors de la modification du mot de passe", newPassword.error?.message) }



  }














}
