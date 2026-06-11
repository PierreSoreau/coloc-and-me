import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { emailMatchValidator } from '../../../_shared/validators/password-match';
import { getFieldErrorMessage, getConfirmEmailError } from '../../../_shared/utils/forms-error';
import { ProfilService, profilData } from '../services/profil.services';
import { AuthService } from '../../authentification/services/auth.services';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';



@Component({
  selector: 'app-new-email',
  imports: [InputComponent, ButtonRecord, ReactiveFormsModule, RouterLink],
  templateUrl: './new-email.html',
  styleUrl: './new-email.scss',
})
export class NewEmail implements OnInit {

  updateEmailForm: FormGroup
  private router = inject(Router)
  private authService = inject(AuthService)
  private profilService = inject(ProfilService)
  private token: string | null = null
  private location = inject(Location)
  currentEmail: string = ""
  isEmitEmail: boolean = true;
  private changeDetectorRef = inject(ChangeDetectorRef)

  constructor(private fb: FormBuilder) {
    this.updateEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],

    }, { validators: emailMatchValidator })
  }


  getErrorMessage(textField: string, nameField: string): string {
    const control = this.updateEmailForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

  getConfirmEmailError(): string {
    return getConfirmEmailError(this.updateEmailForm);
  }

  ngOnInit(): void {
    this.token = localStorage.getItem("token")
    if (!this.token) {
      console.log("Pas de token disponible")
      //il faut surtout pas oublier ce return parce que sinon
      //typescript part du principe qu'après le if tokeninfo peut-être null 
      // parce qu'on a pas arrêté la fonction au if. Le return permet de stopper 
      //la fonction
      return
    }
    this.profilService.getDataProfil(this.token).subscribe({
      next: (response: profilData) => {
        console.log("Données du backend :", response);

        //patchValue permet de modifier après coup un formulaire 
        //c'est indispensable de faire comme ça parce que
        //le navigateur s'occupe du constructeur avant le ngOninit
        //donc il va afficher en premier lieu userfirsname... qui valent ""
        //au début  
        this.currentEmail = response.email_adress

      },
      error: (err) => {
        console.log("Impossible de charger l'adresse mail actuelle sur la page renouvellement adresse mail", err)
      }
    })

  }

  goBack() {
    //Fait exactement comme la flèche retour du navigateur !
    this.location.back();
  }

  toggle(): void {
    this.isEmitEmail = false
    this.changeDetectorRef.detectChanges();

  }

  async onSubmit() {
    if (this.updateEmailForm.invalid) {
      return
    }
    //le "?" permet de dire si c'est pas null et ainsi éviter
    //de lancer un get sur du null  
    const email = this.updateEmailForm.get('email')?.value;


    const newEmail = await this.authService.resetEmail(email)

    if (newEmail.data.user) {
      console.log("La demande est bien enregistrée, et les e-mails contenant les liens de confirmation viennent de partir avec succès.", newEmail.data)
      this.toggle()
      return;
    }

    else { console.log("Erreur lors de la modification de l'adresse mail", newEmail.error?.message) }

  }



}
