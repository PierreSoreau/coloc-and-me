import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ActService, ActResponse } from '../services/act.services';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-act-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './act-home.html',
  styleUrl: './act-home.scss',
})
export class ActHome implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private changeDetectorRef = inject(ChangeDetectorRef)
  private actService = inject(ActService)
  private subscriptions: Subscription = new Subscription();
  actId: number | null = null
  groupId: string | null = null
  actDatas: ActResponse[] = []
  pastActDatas: ActResponse[] = []
  menuOuvert: number | null = null
  userId: string | null = localStorage.getItem("userId")



  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get("groupId")

      if (this.groupId) {

        const actEnCache = this.actService.getCurrentActs()

        //s'il n'y a pas d'élément dans le behaviorsubject dans ce cas
        //on fait la requette sinon on se branche juste au behaviorsubject
        if (actEnCache.length === 0) {
          this.actService.loadActs(this.groupId)
          this.changeDetectorRef.detectChanges()
        }

        //on se branche au behavior pour les activités
        const subActs = this.actService.acts$.subscribe((acts) => {

          this.updateActPosition(acts)

          this.changeDetectorRef.detectChanges()
        })


        this.subscriptions.add(subActs)

      }
    })
  }

  detail(actId: number) {
    this.router.navigate(["/activites/detail-act", this.groupId, actId])
  }

  //fonction qui permet de fermer ou ouvrir le menu déroulant du
  //trois petits points
  toggle(actId: number, event: Event) {

    event.stopPropagation();
    this.menuOuvert = this.menuOuvert === actId ? null : actId
  }

  suppress(actId: number, event: Event) {
    event.stopPropagation();
    this.menuOuvert = null
    this.actService.deleteAct(actId).subscribe({
      next: (response) => {
        console.log("Suppression de l'activité effectuée:", response)
      },

      error: (err) => {
        console.error("impossible de supprimer l'activité", err)
      }
    })

  }

  updateActPosition(acts: ActResponse[]) {
    this.actDatas = acts.filter((act) => new Date(act.date) >= new Date())
    this.pastActDatas = acts.filter((act) => new Date(act.date) <= new Date())
  }

  update(actId: number, event: Event) {
    event.stopPropagation();
    this.menuOuvert = null
    this.router.navigate(["/activites/new-act", this.groupId, actId])
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
