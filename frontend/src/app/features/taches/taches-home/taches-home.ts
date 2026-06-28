import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef, } from '@angular/core';
import { Redirection } from '../../../_shared/button/redirection/redirection';
import { TaskResponse, TasksService } from '../services/tasks.services';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { endOfWeek, startOfWeek, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GroupService, groupInitialAndNameResponse } from '../../group/services/group.services';
import { DatePipe } from '@angular/common';
import { ButtonBack } from '../../../_shared/button/button-back/button-back';

@Component({
  selector: 'app-taches-home',
  imports: [RouterLink, DatePipe, ButtonBack],
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
  openTaskDone: boolean = true



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
      this.groupId = params.get("groupId");
      if (!this.groupId) return;

      // 1. Initialisation unique : génération du calendrier
      this.dateTableforWeeks = this.tasksService.generateWeeksCalendar();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const indexSemaineActuelle = this.dateTableforWeeks.findIndex(week => {
        const lundi = new Date(week.lundi);
        lundi.setHours(0, 0, 0, 0);
        const dimanche = new Date(week.dimanche);
        dimanche.setHours(0, 0, 0, 0);
        return today >= lundi && today <= dimanche;
      });

      this.currentIndex = indexSemaineActuelle !== -1 ? indexSemaineActuelle : 0;




      // 3. Charger les données si nécessaire
      const tachesEnCache = this.tasksService.getCurrentTasks();
      const nomsUsersInCache = this.groupService.getCurrentNames();

      if (tachesEnCache.length === 0) {
        this.tasksService.loadAllDashboardData(this.groupId);
      }
      if (nomsUsersInCache.length === 0) {
        this.groupService.loadNameAndInitials(this.groupId);
      }

      // 4. Souscriptions (les branchements)
      const subNames = this.groupService.namesUsers$.subscribe((names) => {
        this.namesUsers = names;
        this.changeDetectorRef.detectChanges();
      });

      const subTasks = this.tasksService.tasks$.subscribe((tasks) => {
        this.taskDatas = tasks;

        // On met à jour l'affichage avec l'index DÉJÀ calculé ci-dessus
        this.currentWeek = this.tasksService.updateCurrentWeekDisplay(this.dateTableforWeeks, this.currentIndex);
        this.currentYear = this.getYear(this.dateTableforWeeks[this.currentIndex].dimanche);

        this.rafraichirAffichage();
        this.changeDetectorRef.detectChanges();
      });

      this.subscriptions.add(subTasks);
      this.subscriptions.add(subNames);
    });
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

      console.log("liste des dates des semaines pris pour rafraichiraffichage", this.dateTableforWeeks)
      console.log("index de la semaine actuelle pris pour rafraichiraffichage", this.currentIndex)
      console.log("liste des dates pris pour rafraichiraffichage", this.taskDatas)

      this.filterchange(this.filterChange);
      this.changeDetectorRef.detectChanges();
    }
  }

  //fonction qui permet de filtrer uniquement les tâches associées au nom des colocataires
  filterchange(name: string) {
    this.filterChange = name

    console.log("Liste totale de la semaine :", this.tasksListOfWeek);
    console.log("Filtre appliqué :", name);

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


        console.log("Mise à jour du statut de la tâche faite", response)
      },

      error: (error) => {
        console.log("Erreur lors de la mise à jour du statut de la tâche", error)
      }

    })






  }


  // c'est ici qu'on détruit les branchements dans le cas où on quitte 
  // la page home
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}



