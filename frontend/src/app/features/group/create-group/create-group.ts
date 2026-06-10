import { GroupService } from './../services/group.services';
import { Component, inject } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';
import { Router, RouterLink } from '@angular/router';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';
import { InputDynamique } from '../../../_shared/input-dynamique/input-dynamique';
import { ProfilService } from '../../profil/services/profil.services';

export interface dataInput {
  firstname: string
}

@Component({
  selector: 'app-create-group',
  imports: [InputDynamique, ReactiveFormsModule, ButtonRecord, InputComponent],
  templateUrl: './create-group.html',
  styleUrl: './create-group.scss',
})


export class CreateGroup {

  createGroupForm: FormGroup
  inputContentTable: Array<dataInput> = [];
  private groupService = inject(GroupService)
  private router = inject(Router)



  constructor(private fb: FormBuilder) {
    //fb.group ça représente le forumulaire entier
    //group représente une "brique" en quelque sorte qui est aussi un fb.control
    //fb.array est utilisé pour créer des formulaires dynamique c'est
    //fb.array qui se rempli de fb.control au fur et à mesure
    this.createGroupForm = this.fb.group({
      group: ['', [Validators.required, Validators.minLength(2)]],
      participants: this.fb.array([this.fb.control('', [Validators.required, Validators.minLength(2)])])

    })
  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.createGroupForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

  //c'est un getter ici qui est créé 
  //il pourra être utilisé comme une variable dans le html inputArray.controls ça veut dire get tous les 
  //fb.control du inputArray
  get inputArray() {
    return this.createGroupForm.get('participants') as FormArray
  }

  //create Input permet d'ajouter du contenu dans le fb.array 
  //mais attention il fait déclarer le fb.array en tant que 
  //FormArray sinon le push ne marche pas
  createInput(): void {

    this.inputArray.push(this.fb.control('', [Validators.required, Validators.minLength(2)]));
  }

  onSubmit() {

    const token = localStorage.getItem("token")

    if (!token) {
      return
    }


    const groupData = {
      groupName: this.createGroupForm.get("group")?.value,
      participantsList: this.createGroupForm.get("participants")?.value,
    }

    this.groupService.newGroup(groupData).subscribe({
      next: (response) => {
        console.log(`donnée ${groupData}`)
        console.log("Groupe créé")

        this.router.navigate(["/group/link-to-join", response.groupId])
      },

      error: (err) => {
        console.error("Erreur lors de l'enregistrement du groupe", err)
      }
    })



  }

}
