import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { profilData, ProfilService } from '../services/profil.services';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';
import { InputComponent } from '../../../_shared/input/input';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';
import { GroupService } from '../../group/services/group.services';
import { AuthService } from '../../authentification/services/auth.services';



@Component({
  selector: 'app-profil-settings',
  imports: [ButtonRecord, InputComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './profil-settings.html',
  styleUrl: './profil-settings.scss',
})
export class ProfilSettings implements OnInit {

  private dataProfil = inject(ProfilService)
  private groupService = inject(GroupService)
  private authService = inject(AuthService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private token: string | null = null
  userInitials: string = ""
  userfirstname: string = ""
  userlastname: string = ""
  useremail: string = ""
  snackBar: boolean = false
  groupId: string | null = ""
  private changeDetectorRef = inject(ChangeDetectorRef)
  groupDisplay: boolean = false

  updateForm: FormGroup

  constructor(private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      firstName: [this.userfirstname, [Validators.required, Validators.minLength(2)]],
      lastName: [this.userlastname, [Validators.required, Validators.minLength(2)]],
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

    this.groupService.loadUserGroup().subscribe({
      next: (response) => {
        // Le composant redémarre, demande à Node.js, trouve le groupe, et affiche le bouton !
        this.groupId = response.groupId;
        this.groupDisplay = true;
        this.groupService.notifyHeaderOfGroupChange(this.groupId)
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.groupId = null;
        this.groupDisplay = false;
        this.changeDetectorRef.detectChanges();
      }
    });

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

  deleteGroup() {
    if (!this.groupId) {
      return
    }

    this.dataProfil.deleteGroupData(this.groupId).subscribe({
      next: () => {
        console.log("Groupe supprimé")
        this.groupId = null
        this.groupDisplay = false
        this.changeDetectorRef.detectChanges();
        this.groupService.clearCurrentGroupId();
        this.router.navigate(['/group/group-home']);

      },
      error: (err) => {
        console.error("Impossible de supprimer le groupe", err)
      }
    })




  }


  async logOut() {

    try {
      await this.authService.signOutSupabase();
      //cette fonction est indispensable pour supprimer 
      //les sessions cachées de supabase
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");


      this.router.navigate(["/introduction"])
    }
    catch (error) {
      console.log("Erreur au moment de la deconnection", error)
    }

  }



  onSubmit() {
    if (this.updateForm.invalid) {
      console.log("formulaire invalide")
      return
    }

    if (!this.token) {
      return
    }
    const newName = {
      firstname: this.updateForm.get('firstName')?.value,
      lastname: this.updateForm.get('lastName')?.value,
      token: this.token
    }

    this.dataProfil.updateProfil(newName).subscribe({
      next: (response: string) => {
        console.log("Nom du profil mis à jour")

        //on est obligé de relancer l'affichage du contenu du profil
        //qui a changé sinon ça se met pas à jour (nom, prenom, initiales)
        this.userfirstname = newName.firstname
        this.userlastname = newName.lastname
        this.userInitials = (this.userfirstname.charAt(0) + this.userlastname.charAt(0)).toUpperCase();
        this.snackBar = true;

        //changeDetectorRef permet de réveiller Angular dans le cas 
        //ou il veut pas afficher un élément qui arrive après qu'il
        //ait affiché tout une page
        this.changeDetectorRef.detectChanges();

        setTimeout(() => { this.snackBar = false; this.changeDetectorRef.detectChanges(); }, 3000)


      },
      error: (err) => {
        console.log("Impossible de mettre à jour les informations du profil", err)
      }
    })
  }

}
