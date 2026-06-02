import { Router } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { profilData, ProfilService } from '../services/profil.services';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';
import { InputComponent } from '../../../_shared/input/input';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';



@Component({
  selector: 'app-profil-settings',
  imports: [ButtonRecord, InputComponent, ReactiveFormsModule],
  templateUrl: './profil-settings.html',
  styleUrl: './profil-settings.scss',
})
export class ProfilSettings implements OnInit {

  private dataProfil = inject(ProfilService)
  private router = inject(Router)
  private token: string | null = null
  userInitials: string = ""
  userfirstname: string = ""
  userlastname: string = ""
  useremail: string = ""

  updateForm: FormGroup

  constructor(private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      firstName: [this.userfirstname, [Validators.required, Validators.minLength(2)]],
      lastName: [this.userlastname, [Validators.required, Validators.minLength(2)]],
      email: [this.useremail, [Validators.required, Validators.email]]
    })
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
    this.dataProfil.getInitials(this.token).subscribe({
      next: (response: string) => {
        console.log("initales:", response)
        this.userInitials = response
      },

      error: (err) => {
        console.error("impossible de charger la donnée", err)
      }


    })
    this.dataProfil.getDataProfil(this.token).subscribe({
      next: (response: profilData) => {
        console.log("Données du backend :", response);

        this.userfirstname = response.firstname
        this.userlastname = response.lastname
        this.useremail = response.email_adress

        //patchValue permet de modifier après coup un formulaire 
        //c'est indispensable de faire comme ça parce que
        //le navigateur s'occupe du constructeur avant le ngOninit
        //donc il va afficher en premier lieu userfirsname... qui valent ""
        //au début  
        this.updateForm.patchValue({
          firstName: response.firstname,
          lastName: response.lastname,
          email: response.email_adress
        })
      },
      error: (error) => {
        console.error("Impossible de récupérer les données", error)

      }
    })

  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.updateForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }


  logOut() {
    if (!this.token) {
      return
    }
    this.dataProfil.logOut(this.token).subscribe({
      next: (response: string) => {
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token");
        this.router.navigate(["/auth/login"])
      },
      error: (err) => {
        console.log("Erreur au moment de la deconnection", err)
      }

    })

  }

  onSubmit() {
    if (this.updateForm.invalid) {
      console.log("formulaire invalide")
      return
    }
  }

}
