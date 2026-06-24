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
        const subTasks = this.actService.acts$.subscribe((tasks) => {
          this.actDatas = tasks
          this.changeDetectorRef.detectChanges()
        })


        this.subscriptions.add(subTasks)

      }
    })
  }

  detail(actId: number) {
    this.router.navigate(["/activites/detail-act", this.groupId, actId])
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
