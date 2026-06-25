import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GroupService } from '../../group/services/group.services';
import { TasksService, TaskResponse } from '../../taches/services/tasks.services';
import { DepensesService } from '../../depenses/services/depenses.services';
import { ActService, ActResponse } from '../../activites/services/act.services';
import { Subscription } from 'rxjs';
import { ProfilService } from '../../profil/services/profil.services';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private groupService = inject(GroupService)
  private taskService = inject(TasksService)
  private depensesService = inject(DepensesService)
  private profilService = inject(ProfilService)
  private subscriptions: Subscription = new Subscription();
  private actService = inject(ActService)
  private changeDetectorRef = inject(ChangeDetectorRef)
  groupId: string | null = null
  actDatas: ActResponse | null = null
  taskDatas: TaskResponse[] = []
  debtAmount: number = 0
  userId: string | null = localStorage.getItem("userId")
  token: string | null = localStorage.getItem("token")
  firstname: string | null = null


  ngOnInit(): void {

    //en gros au lieu de prendre une photo à un instant 
    // t on écoute si changement de l'url et si présence du paramètre de l'url 
    // on prévient le header du changement
    this.route.paramMap.subscribe(params => {
      //on chope le groupId de l'url
      this.groupId = params.get("groupId")

      if (this.groupId) {
        this.groupService.notifyHeaderOfGroupChange(this.groupId)

        const actEnCache = this.actService.getCurrentActs()
        const taskEnCache = this.taskService.getCurrentTasks()

        //s'il n'y a pas d'élément dans le behaviorsubject dans ce cas
        //on fait la requette sinon on se branche juste au behaviorsubject
        if (actEnCache.length === 0) {
          this.actService.loadActs(this.groupId)
          this.changeDetectorRef.detectChanges()
        }

        if (taskEnCache.length === 0) {
          this.taskService.loadTasks(this.groupId)
          this.changeDetectorRef.detectChanges()
        }

        //on se branche au behavior pour les activités
        const subActs = this.actService.acts$.subscribe((acts) => {
          // il faut rajouter getTime parce que des fois comparer des dates 
          //bugg si on met pas getTime
          const now = new Date().getTime();

          // On filtre pour garder que les données venir
          const futureActs = acts.filter(act => new Date(act.date).getTime() >= now);

          //On trie ces activités dans l'ordre croissant des dates
          futureActs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          // On récupère la première du tableau trié (donc le minimum !)
          // S'il n'y a aucune tâche future, on renvoie null ou undefined
          this.actDatas = futureActs.length > 0 ? futureActs[0] : null;

          this.changeDetectorRef.detectChanges();


        })

        const subTasks = this.taskService.tasks$.subscribe((tasks) => {

          this.taskDatas = tasks.filter((task) => new Date(task.date).toDateString() === new Date().toDateString() && task.userTaskId === this.userId)
          this.changeDetectorRef.detectChanges()
        })


        if (this.token) {
          this.profilService.getDataProfil(this.token).subscribe({
            next: (response) => {


              this.firstname = response.firstname


              this.changeDetectorRef.detectChanges();

              console.log("Affichage du prénom", response.firstname)
            },

            error: (error) => {
              console.log("Erreur lors de l'affichage du prénom", error)
            }

          })
        }


        this.depensesService.getallUserBalance(this.groupId).subscribe({
          next: (response) => {


            const debtData = response.find((debt) => debt.userId === this.userId)

            if (debtData) {

              this.debtAmount = debtData.debtAmount
            }


            this.changeDetectorRef.detectChanges();

            console.log("Mise à jour de la dette de l'utilisateur", this.debtAmount)
          },

          error: (error) => {
            console.log("Erreur lors de la mise à jour de la dette de l'utilisateur", error)
          }

        })
        this.subscriptions.add(subActs)
        this.subscriptions.add(subTasks)

      }





    })

  }


}


