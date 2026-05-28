import { ButtonRecord } from './../../../_shared/button/button_record/button-record';
import { Component, inject, OnInit } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { AuthService } from '../services/auth.services';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';
import { ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { ButtonBack } from '../../../_shared/button/button-back/button-back';


@Component({
  selector: 'app-forgot-password',
  imports: [ButtonRecord, InputComponent, RouterLink, ReactiveFormsModule, ButtonBack],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword implements OnInit {
  private forgotPasswordTitle = inject(Title);
  private authService = inject(AuthService)
  private changeDetectorRef = inject(ChangeDetectorRef)
  private location = inject(Location)
  public isEmitEmail: boolean = false


  ngOnInit(): void {
    this.forgotPasswordTitle.setTitle('Coloc&Me | Mot de passe oublié')


  }

  goBack(): void {
    this.location.back();
  }

  forgotPasswordForm: FormGroup

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }


  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return
    }

    const rawData = this.forgotPasswordForm.value

    const cleanData = {
      email_adress: rawData.email
    }

    this.authService.forgotPassword(cleanData).subscribe({
      next: (reponse) => {
        console.log("🟢 SUCCÈS : Angular est bien rentré dans le next !", reponse);
        this.isEmitEmail = true
        //permet rafraichir l'écran en forcé, je le demande parce que sinon
        //la page mail envoyé ne se met qu'au deuxième clic du bouton créer un nouveau mail
        //pourtant le mail est bien envoyé
        this.changeDetectorRef.detectChanges();
        //
      },
      error: (err) => {
        console.error("🔴 ERREUR : La requête a marché, mais Angular a rejeté la réponse !", err);
        console.error("Echec reset password", err);
      }
    })

  }


  getErrorMessage(textField: string, nameField: string): string {
    const control = this.forgotPasswordForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

  toggle(): void {
    this.isEmitEmail = false
    this.changeDetectorRef.detectChanges();

  }

}


