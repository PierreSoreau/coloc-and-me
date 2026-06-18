import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef, } from '@angular/core';
import { Redirection } from '../../../_shared/button/redirection/redirection';
import { TaskResponse, TasksService } from '../services/tasks.services';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { endOfWeek, startOfWeek, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GroupService, groupInitialAndNameResponse } from '../../group/services/group.services';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-taches-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './taches-home.html',
  styleUrl: './taches-home.scss',
})
export class TachesHome implements OnInit, OnDestroy {



  groupId: string | null = null
  taskDatas: TaskResponse[] = []
  tasksListOfWeek: TaskResponse[] = []
  dateTableforWeeks: { lundi: string, dimanche: string }[] = []
  currentDate: Date = new Date()
  namesUsers: groupInitialAndNameResponse[] = []
  filterChange: string = "Tous"
  taskFiltreesByName: TaskResponse[] = []
  taskFiltreesByNameDone: TaskResponse[] = []
  selectedYear: number = new Date().getFullYear();
  finalDateTask: string = ""



  currentIndex: number = 0

  currentYear: number = 0
  currentWeek: { lundi: string, dimanche: string } = { lundi: "", dimanche: "" }
  //le reliage au behaviorsubject des taches et data sera stocké là dedans
  //de manière à pouvoir les supprimer à chaque changement de page
  //sinon les liaisons ne se suppriment pas ce qui fait beaucoup
  //de demande et ça fait ramer voir planter l'appli
  private subscriptions: Subscription = new Subscription();
  private route = inject(ActivatedRoute)
  private tasksService = inject(TasksService)
  private groupService = inject(GroupService)
  private changeDetectorRef = inject(ChangeDetectorRef)

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get("groupId")
      if (this.groupId) {

        const tachesEnCache = this.tasksService.getCurrentTasks()
        const nomsUsersInCache = this.groupService.getCurrentNames()
        //s'il n'y a pas d'élément dans le behaviorsubject dans ce cas
        //on fait la requette sinon on se branche juste au behaviorsubject
        if (tachesEnCache.length === 0) {
          this.tasksService.loadAllDashboardData(this.groupId)
        }

        if (nomsUsersInCache.length === 0) {
          this.groupService.loadNameAndInitials(this.groupId)
        }

        //on se branche au behavior pour les noms des utilisateurs du groupe
        const subNames = this.groupService.namesUsers$.subscribe((names) => {
          this.namesUsers = names
          console.log("Noms des utilisateurs mis à jour :", this.namesUsers)
          this.changeDetectorRef.detectChanges()
            ;
        })

        //on se branche au behavior pour les taches
        const subTasks = this.tasksService.tasks$.subscribe((tasks) => {
          this.taskDatas = tasks


          // 1. Génère le calendrier
          this.dateTableforWeeks = this.tasksService.generateWeeksCalendar();

          if (this.currentWeek.lundi === "") {

            // 2. Trouve l'index de la semaine actuelle
            const today = new Date();
            const indexSemaineActuelle = this.dateTableforWeeks.findIndex(week => {
              const lundi = new Date(week.lundi);
              const dimanche = new Date(week.dimanche);
              return today >= lundi && today <= dimanche;
            });

            // 3. Applique l'index (ou 0 par défaut si on est hors année)
            this.currentIndex = indexSemaineActuelle !== -1 ? indexSemaineActuelle : 0;
          }

          else {
            if (this.currentIndex >= this.dateTableforWeeks.length) {
              this.currentIndex = 0;
            }
          }

          // 4. Initialise l'affichage pour cette semaine spécifique
          this.currentWeek = this.tasksService.updateCurrentWeekDisplay(this.dateTableforWeeks, this.currentIndex);
          this.currentYear = this.getYear(this.dateTableforWeeks[this.currentIndex].dimanche);
          this.rafraichirAffichage();
          this.filterchange(this.filterChange);

          this.changeDetectorRef.detectChanges()


          console.log("Tâches mises à jour :", this.taskDatas);
        })



        this.subscriptions.add(subTasks)

        this.subscriptions.add(subNames)

      }
    })
  }

  getYear(dateString: string): number {
    const date = new Date(dateString);
    return date.getFullYear();
  }




  getDateWeekRight() {

    if (!this.dateTableforWeeks || this.dateTableforWeeks.length === 0) return;

    if (this.currentIndex === (this.dateTableforWeeks.length) - 1) {
      this.currentIndex = 0
    }
    else {
      this.currentIndex++
    }

    this.currentWeek = this.tasksService.updateCurrentWeekDisplay(this.dateTableforWeeks, this.currentIndex);
    this.currentYear = this.getYear(this.dateTableforWeeks[this.currentIndex].dimanche);
    this.tasksListOfWeek = this.tasksService.updateCurrentWeekTasks(this.dateTableforWeeks, this.currentIndex, this.taskDatas);

    this.filterchange(this.filterChange)

    this.changeDetectorRef.detectChanges();


  }

  getDateWeekLeft() {

    if (!this.dateTableforWeeks || this.dateTableforWeeks.length === 0) return;
    if (this.currentIndex === 0) {
      this.currentIndex = (this.dateTableforWeeks.length) - 1
    }

    else { this.currentIndex-- }

    this.currentWeek = this.tasksService.updateCurrentWeekDisplay(this.dateTableforWeeks, this.currentIndex);
    this.currentYear = this.getYear(this.dateTableforWeeks[this.currentIndex].dimanche);
    this.tasksListOfWeek = this.tasksService.updateCurrentWeekTasks(this.dateTableforWeeks, this.currentIndex, this.taskDatas);


    this.filterchange(this.filterChange)



    this.changeDetectorRef.detectChanges();


  }

  rafraichirAffichage() {
    if (this.dateTableforWeeks.length > 0 && this.taskDatas.length > 0) {
      this.tasksListOfWeek = this.tasksService.updateCurrentWeekTasks(
        this.dateTableforWeeks,
        this.currentIndex,
        this.taskDatas
      );

      this.filterchange(this.filterChange);
      this.changeDetectorRef.detectChanges();
    }
  }

  //fonction qui permet de filtrer uniquement les tâches associées au nom des colocataires
  filterchange(name: string) {
    this.filterChange = name

    if (name === 'Tous') {
      this.taskFiltreesByName = this.tasksListOfWeek.filter((task) => {
        return !task.status
      });
      this.taskFiltreesByNameDone = this.tasksListOfWeek.filter((task) => {
        return task.status
      });
    }
    else {

      this.taskFiltreesByName = this.tasksListOfWeek.filter((task) => {
        return !task.status && task.firstname === name
      });
      this.taskFiltreesByNameDone = this.tasksListOfWeek.filter((task) => {
        return task.status && task.firstname === name
      });

    }



  }


  changeStatus(taskId: number, currentStatus: boolean) {

    const newStatus = !currentStatus;
    const dateFaitLe = newStatus ? format(new Date(), 'dd-MM-yyyy') : "";

    this.tasksService.updateTaskStatus(dateFaitLe, taskId, newStatus).subscribe({
      next: (response) => {


        this.tasksService.loadAllDashboardData(this.groupId!)


        this.changeDetectorRef.detectChanges();

        console.log("Mise à jour du statut de la tâche faite", response)
      },

      error: (error) => {
        console.log("Erreur lors de la mise à jour du statut de la tâche", error)
      }

    })






  }

  displayTaskModel(taskId: number) {

  }




  // c'est ici qu'on détruit les branchements dans le cas où on quitte 
  // la page home
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}



