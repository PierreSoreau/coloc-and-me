import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ActService, ActResponse } from '../services/act.services';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';
import { ButtonBack } from '../../../_shared/button/button-back/button-back';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';

@Component({
  selector: 'app-detail-act',
  imports: [DatePipe, ReactiveFormsModule, ButtonBack, ButtonRecord],
  templateUrl: './detail-act.html',
  styleUrl: './detail-act.scss',
})
export class DetailAct implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private changeDetectorRef = inject(ChangeDetectorRef)
  private actService = inject(ActService)
  private subscriptions: Subscription = new Subscription();
  actId: number | null = null
  groupId: string | null = null
  actDatas: ActResponse[] = []
  targetActData: ActResponse | null = null
  checkActiviteForm: FormGroup
  userId: string | null = localStorage.getItem("userId")

  constructor(private fb: FormBuilder) {
    this.checkActiviteForm = this.fb.group({
      authorisation: this.fb.control<string>(''),
      participation: this.fb.control<string>('')
    })

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get("groupId")
      const paramactId = params.get("actId")
      this.actId = paramactId ? Number(paramactId) : null

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
          if (this.actId) {

            // ?? veut dire si ça renvoit undefined transforme le en null

            this.targetActData = this.actDatas.find((act) => act.actId === this.actId) ?? null

            if (this.targetActData) {

              this.targetActData.authorisationAndParticipationStatus =
                this.targetActData.authorisationAndParticipationStatus.map((status) => {

                  return {
                    profilId: status.profilId,
                    initial: status.firstname.charAt(0).toUpperCase(),
                    firstname: status.firstname,
                    participationStatus: status.participationStatus,
                    authorisationStatus: status.authorisationStatus,
                    profilStatus: status.profilStatus
                  }
                })


              for (const data of this.targetActData.authorisationAndParticipationStatus) {

                if (data.profilId === this.userId) {
                  this.checkActiviteForm.patchValue({
                    authorisation: data.authorisationStatus,
                    participation: data.participationStatus
                  });
                }

              }





            }

            this.changeDetectorRef.detectChanges()
          }
        })


        this.subscriptions.add(subTasks)

      }


    })
  }

  isUserTheOrganizer(userId: string | null) {

    if (!userId) {
      return
    }
    if (!this.targetActData) {
      return
    }

    const userStatusList = this.targetActData?.authorisationAndParticipationStatus.find((data) => data.profilId === userId)

    if (userStatusList?.profilStatus === "organisateur") {
      return true
    }

    return false



  }

  onSubmit() {

    const token = localStorage.getItem("token")

    if (token) {

      const newStatus = this.checkActiviteForm.value



      this.actService.updateStatus(token, newStatus.participation, newStatus.authorisation).subscribe({
        next: (response) => {
          console.log("mise à jour du statut du coloc pour l'activité faite:", response)
          this.router.navigate(["/activites/act-home", this.groupId])

        },

        error: (err) => {
          console.error("impossible de mettre à jour le statut du coloc pour l'activité", err)
        }


      })
    }


  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}






