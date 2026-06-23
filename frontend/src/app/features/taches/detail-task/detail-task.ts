import { Component, inject, OnInit } from '@angular/core';
import { TasksService } from '../services/tasks.services';
import { ChangeDetectorRef } from '@angular/core';
import { format } from 'date-fns';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonDelete } from '../../../_shared/button/button-delete/button-delete';
import { ButtonBack } from '../../../_shared/button/button-back/button-back';
import { ButtonUpdate } from '../../../_shared/button/button-update/button-update';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-detail-task',
  imports: [ButtonDelete, ButtonBack, ButtonUpdate, DatePipe],
  templateUrl: './detail-task.html',
  styleUrl: './detail-task.scss',
})
export class DetailTask implements OnInit {

  groupId: string | null = null
  taskId: number | null = null
  frequency: string = ""
  title: string = ""
  description: string = ""
  date: string = ""
  firstname: string = ""
  status: boolean = false
  taskModel: number = 0


  private tasksService = inject(TasksService)
  private changeDetectorRef = inject(ChangeDetectorRef)
  private router = inject(Router)
  private route = inject(ActivatedRoute)


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get("groupId")
      const tacheParam = params.get("tacheId")
      this.taskId = tacheParam !== null ? Number(tacheParam) : null
      if (this.taskId) {

        this.tasksService.getTaskById(this.taskId).subscribe({
          next: (response) => {

            this.title = response.title
            this.description = response.description
            this.firstname = response.firstname
            this.date = response.date
            this.frequency = response.frequence
            this.status = response.status
            this.taskModel = response.taskId


            this.changeDetectorRef.detectChanges();



            console.log("Récupération de la tâche effectuée", response)

          },
          error: (err) => {
            console.error("Erreur lors de la récupération de la tâche", err)
          }
        })




      }
    })
  }


  updateTask() {
    this.router.navigate(["/taches/nouvelle-tache", this.groupId, this.taskId])
  }


  deleteAllTask() {

    this.tasksService.deleteallTask(this.taskModel).subscribe({
      next: (response) => {


        this.router.navigate(["/taches", this.groupId])


        console.log("Suppression de toutes les tâches du modèle", response)
      },

      error: (error) => {
        console.log("Erreur lors de la suppression des tâches du modèle", error)
      }

    })


  }





  deleteTask() {

    if (!this.taskId) {
      return
    }


    this.tasksService.deleteTask(this.taskId, this.frequency).subscribe({
      next: (response) => {


        this.router.navigate(["/taches", this.groupId])


        console.log("Suppression de la tâche faite", response)
      },

      error: (error) => {
        console.log("Erreur lors de la suppression de la tâche", error)
      }

    })


  }







  changeStatus(taskId: number, currentStatus: boolean) {

    const newStatus = !currentStatus;
    const dateFaitLe = newStatus ? format(new Date(), 'dd-MM-yyyy') : "";

    this.tasksService.updateTaskStatus(dateFaitLe, taskId, newStatus).subscribe({
      next: (response) => {


        this.router.navigate(["/taches", this.groupId])


        console.log("Mise à jour du statut de la tâche faite", response)
      },

      error: (error) => {
        console.log("Erreur lors de la mise à jour du statut de la tâche", error)
      }

    })






  }


}
