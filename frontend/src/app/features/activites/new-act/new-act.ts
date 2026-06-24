import { Title } from '@angular/platform-browser';
import { DepensesService } from './../../depenses/services/depenses.services';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';
import { InputComponent } from '../../../_shared/input/input';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';
import { GroupService, groupInitialAndNameResponse } from '../../group/services/group.services';
import { ButtonBack } from '../../../_shared/button/button-back/button-back';
import { format } from 'date-fns';
import { concatMap } from 'rxjs/operators';
import { ActService } from '../services/act.services';

export interface ActiviteFormType {
  location: FormControl<string | null>;
  titre: FormControl<string | null>;
  date: FormControl<string | null>;
  heure: FormControl<string | null>;
  lieu: FormControl<string | null>;
  description: FormControl<string | null>;
}

@Component({
  selector: 'app-new-act',
  imports: [ButtonBack, ButtonRecord, InputComponent, ReactiveFormsModule],
  templateUrl: './new-act.html',
  styleUrl: './new-act.scss',
})
export class NewAct implements OnInit {

  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private changeDetectorRef = inject(ChangeDetectorRef)
  private groupService = inject(GroupService)
  private actService = inject(ActService)
  private token: string | null = null
  groupId: string | null = ""
  actId: number | null = null
  buttonValue: string = "Créer l'activité"
  wrongForm: string = ""


  newActiviteForm!: FormGroup<ActiviteFormType>



  constructor(private fb: FormBuilder) {
    this.newActiviteForm = this.fb.group({
      location: this.fb.control<string>('', [Validators.required, Validators.minLength(2)]),
      titre: this.fb.control<string>('', [Validators.required, Validators.minLength(2)]),
      date: this.fb.control<string>('', [Validators.required]),
      heure: this.fb.control<string>('', [Validators.required]),
      lieu: this.fb.control<string>('', [Validators.required]),
      description: this.fb.control<string>('', [Validators.required, Validators.minLength(2)]),

    })

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      this.groupId = param.get("groupId")
      const actParam = param.get("actId")

      this.actId = actParam !== null ? Number(actParam) : null

      if (this.groupId) {
        this.groupService.notifyHeaderOfGroupChange(this.groupId)



      }



    })


  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.newActiviteForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

  onSubmit() {

    if (this.newActiviteForm.invalid) {
      this.wrongForm = "Tous les champs du formulaire doivent être renseignés"
      return
    }

    this.token = localStorage.getItem("token")

    const newAct = this.newActiviteForm.value

    const date = `${newAct.date}T${newAct.heure}:00`

    if (!this.token || !newAct.titre
      || !newAct.description || !newAct.location
      || !date || !this.groupId || !newAct.lieu) {
      return
    }


    const ActData = {
      title: newAct.titre,
      description: newAct.description,
      typeLocation: newAct.location,
      location: newAct.lieu,
      date: date,
      groupId: this.groupId
    }



    this.actService.newAct(ActData, this.token).subscribe({
      next: (response) => {
        console.log("création de la nouvelle activité faite:", response)
        this.router.navigate(["/activites/act-home", this.groupId])

      },

      error: (err) => {
        console.error("impossible de charger la donnée", err)
      }


    })





  }
}








