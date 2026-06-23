import { Title } from '@angular/platform-browser';
import { DepensesService } from './../../depenses/services/depenses.services';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';
import { InputComponent } from '../../../_shared/input/input';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';
import { GroupService, groupInitialAndNameResponse } from '../../group/services/group.services';
import { AuthService } from '../../authentification/services/auth.services';
import { TasksService } from '../services/tasks.services';
import { ButtonBack } from '../../../_shared/button/button-back/button-back';
import { format } from 'date-fns';
import { concatMap } from 'rxjs/operators';

export interface TaskFormType {
  nom: FormControl<string | null>;
  comments: FormControl<string | null>;
  frequency: FormControl<string | null>;
  date: FormControl<string | null>;
  taskUserId: FormControl<string | null>;
}

@Component({
  selector: 'app-new-task',
  imports: [InputComponent, ButtonRecord, ReactiveFormsModule, ButtonBack],
  templateUrl: './new-task.html',
  styleUrl: './new-task.scss',
})



export class NewTask {

  private tasksService = inject(TasksService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private groupService = inject(GroupService)
  groupId: string | null = ""
  private changeDetectorRef = inject(ChangeDetectorRef)
  groupDisplay: boolean = false
  names: groupInitialAndNameResponse[] = []
  taskId: number | null = null
  buttonValue: string = "Créer une tâche"
  wrongForm: string = ""
  nomPlaceholder: string = "Ex:nettoyer la cuisine"
  datePlaceholder: string = ""
  isEditingRecurringTask: boolean = false
  idDuModele: number | null = null;




  newTaskForm!: FormGroup<TaskFormType>



  constructor(private fb: FormBuilder) {
    this.newTaskForm = this.fb.group({
      nom: this.fb.control<string | null>('', [Validators.required, Validators.minLength(2)]),
      comments: this.fb.control<string | null>('', [Validators.required, Validators.minLength(2)]),
      frequency: this.fb.control<string | null>(''),
      date: this.fb.control<string | null>(''),
      taskUserId: this.fb.control<string | null>('')
    })
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      this.groupId = param.get("groupId")
      const taskParam = param.get("tacheId")

      this.taskId = taskParam !== null ? Number(taskParam) : null

      if (this.groupId) {
        this.groupService.notifyHeaderOfGroupChange(this.groupId)
        this.groupService.getNamePlusInitials(this.groupId).subscribe({
          next: (response) => {

            this.names = response

            this.changeDetectorRef.detectChanges();

            console.log("Récupération des données des nom des profils faites")
          },

          error: (err) => {
            console.error("Erreur lors de la récupération des données des nom des profils")
          }
        })

        //création d'une validation conditionnelle pour le contenu de l'id en charge de la tache
        //si jamais il y a une périodicité sur la tache dans ce cas tu ne mets personne en personne
        //attribuée pour la tâche donc ça veut dire qu'on ne met pas validators required
        //à l'inverse si c'est une tache unique faut obligatoirement choisir quelqu'un
        //on écoute donc la présence ou l'absence de la frequence dans le formulaire
        //meme chose pour la date limite de la tache
        this.newTaskForm.get('frequency')?.valueChanges.subscribe(frequencyChange => {


          const userTaskIdControl = this.newTaskForm.get('taskUserId')
          const limitDateControl = this.newTaskForm.get('date')

          if (frequencyChange) {
            userTaskIdControl?.clearValidators()
            limitDateControl?.clearValidators()
          }
          else {
            userTaskIdControl?.setValidators([Validators.required])
            limitDateControl?.setValidators([Validators.required])
          }

          userTaskIdControl?.updateValueAndValidity()
          limitDateControl?.updateValueAndValidity()

        })

        if (this.taskId) {
          this.tasksService.getTaskById(this.taskId).subscribe({
            next: (response) => {

              this.idDuModele = response.taskId;

              this.newTaskForm.patchValue({
                nom: response.title,
                comments: response.description ? response.description : '',
                frequency: response.frequence ? response.frequence : '',
                date: response.date,
                taskUserId: response.frequence ? '' : response.userTaskId
              })
              // Si la tâche a une fréquence, on empêche de changer le select
              if (response.frequence) {
                this.isEditingRecurringTask = true
              }
              // Si c'est une tâche unique, tu peux aussi désactiver 
              // pour empêcher de la rendre récurrente
              else {
                this.newTaskForm.get('frequency')?.disable();

              }


              this.buttonValue = "Modifier la tâche"


              this.changeDetectorRef.detectChanges();

              console.log("Récupération des données de la tâche faite")

            },

            error: (err) => {
              console.error("Erreur lors de la récupération des données de la tâche")
            }


          });

        }

      }


    })

  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.newTaskForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

  get isFrequency(): boolean {
    if (this.newTaskForm.get("frequency")?.value === '' || this.newTaskForm.get("frequency")?.value === null) {
      return false
    }
    return true
  }




  onSubmit() {

    if (this.newTaskForm.invalid) {
      this.wrongForm = "Tous les champs du formulaire doivent être renseignés"
      return
    }

    //le getRawValue est indispensable ici parce que sinon ça ne prend pas
    //les valeurs disabled
    const taskData = this.newTaskForm.getRawValue()

    if (this.taskId) {
      if (taskData.frequency === "") {
        this.tasksService.updateTaskDetail(this.taskId, taskData.comments!,
          taskData.nom!, taskData.date!,
          taskData.taskUserId!,
          null).subscribe({
            next: (response) => {
              console.log(response)
              this.router.navigate(["/taches", this.groupId])
            },
            error: (err) => {
              console.error("Erreur lors de la mise à jour de la tâche", err)
            }
          });
        return;
      }

      else {
        this.tasksService.updateTaskDetail(
          this.taskId,
          taskData.comments!,
          taskData.nom!,
          taskData.date!,
          taskData.taskUserId!,
          taskData.frequency!
        ).pipe(
          //concatMap permet d'éviter de faire des susbscribe imbriqués qu'Angular gère mal
          // 1. Dès que l'update est terminé, on lance la suppression
          concatMap(() => this.tasksService.deleteTasksAfterCurrentDay(this.idDuModele!)),

          // 2. Dès que la suppression est terminée, on lance la création
          concatMap(() => this.tasksService.newTasksForModelAfterToday(this.idDuModele!))
        )
          .subscribe({
            next: (response) => {
              // Ce next() ne s'exécute QUE si les 3 requêtes ont réussi à la suite !
              console.log("Séquence de mise à jour terminée avec succès", response);
              this.router.navigate(["/taches", this.groupId]);
            },
            error: (err) => {
              // Une seule gestion d'erreur centralisée !
              // Si l'une des 3 requêtes plante, le code saute directement ici.
              console.error("Erreur dans la séquence de mise à jour des occurences :", err);
            }
          });

        return;


      }
    }

    const taskArguments = {
      taskName: taskData.nom!,
      taskDescription: taskData.comments!,
      frequency: taskData.frequency || null,
      date: taskData.date || null,
      userForTask: taskData.taskUserId || null,
      groupId: this.groupId!,
      //format transforme en un string un type Date pour pouvoir le transporter vers node
      ancre: taskData.frequency && this.tasksService.ancre(taskData.frequency)
        ? format(this.tasksService.ancre(taskData.frequency)!, 'yyyy-MM-dd')
        : null
    }

    this.tasksService.newTask(taskArguments).subscribe({
      next: (response) => {
        console.log("Nouvelle tâche enregistrée", response)
        this.router.navigate(["/taches", this.groupId])
      },
      error: (err) => {
        console.error("Erreur lors de la création de la tâche", err)
      }
    });

  }
}






