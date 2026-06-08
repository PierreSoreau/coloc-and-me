import { Redirection } from './../../../_shared/button/redirection/redirection';
import { GroupService } from './../services/group.services';
import { Component, inject } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';
import { Router, RouterLink } from '@angular/router';
import { ProfilService } from '../../profil/services/profil.services';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';

@Component({
  selector: 'app-join-group',
  imports: [ReactiveFormsModule, InputComponent, ButtonRecord],
  templateUrl: './join-group.html',
  styleUrl: './join-group.scss',
})
export class JoinGroup {
  joinForm: FormGroup
  private groupService = inject(GroupService)
  private router = inject(Router)


  constructor(private fb: FormBuilder) {
    //fb.group ça représente le forumulaire entier
    //group représente une "brique" en quelque sorte qui est aussi un fb.control
    //fb.array est utilisé pour créer des formulaires dynamique c'est
    //fb.array qui se rempli de fb.control au fur et à mesure
    this.joinForm = this.fb.group({
      link: ['', [Validators.required]],
    })
  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.joinForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

  onSubmit() {

    // Cherche le champ 'link'. SI ET SEULEMENT SI tu le trouves, donne-moi sa .value. 
    // Mais s'il n'existe pas (s'il est null ou undefined), alors arrête-toi tout de suite, 
    // ne cherche pas de valeur, et renvoie-moi juste undefined en silence, sans faire planter l'application."
    const rawlink = this.joinForm.get("link")?.value

    //dans le cas où il ne trouve pas il va mettre undefined et dans ce cas 
    //tu arrêtes la fonction sinon ça va crasher
    if (!rawlink) {
      return
    }

    //là ici on fait un try catch pour éviter que cela plante pour le parsing de l'url
    //dans le cas où ça plante avec le catch ça fait une erreur mais ça plante pas toute l'appli
    try {
      if (rawlink.startsWith("http://") || rawlink.startsWith("https://")) {

        //outil interne à angular qui permet de spliter un url
        const newUrl = new URL(rawlink)

        //permet de récupérer que ce qu'il y a après le 4200 via pathname
        const url = newUrl.pathname

        this.router.navigate([url])
      }
    }
    catch (error) {
      console.error("Le lien url fourni n'est pas valide:", error)
    }



  }

}
