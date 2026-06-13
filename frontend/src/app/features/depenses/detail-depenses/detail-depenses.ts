import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DepensesService, NameUserDebt } from '../services/depenses.services';
import { DatePipe } from '@angular/common';
import { ButtonBack } from '../../../_shared/button/button-back/button-back';


@Component({
  selector: 'app-detail-depenses',
  imports: [DatePipe, ButtonBack],
  templateUrl: './detail-depenses.html',
  styleUrl: './detail-depenses.scss',
})
export class DetailDepenses implements OnInit {

  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private depenseService = inject(DepensesService)
  private changeDetectorRef = inject(ChangeDetectorRef)
  expenseId: number | null = null
  groupId: string | null = null
  description: string = ""
  date: string = ""
  initialsPayer: string = ""
  firstnamePayer: string = ""
  expenseAmount: number = 0
  debtAmount: number = 0
  debtData: NameUserDebt[] = []


  ngOnInit(): void {

    //on chope le groupId de l'url
    this.route.paramMap.subscribe(params => {
      const expenseParam = params.get("expenseId")
      this.groupId = params.get("groupId")
      //on convertit le paramètre expenseId qui est dans l'url en type number parce 
      //que de base le paramètre est en string
      this.expenseId = expenseParam !== null ? Number(expenseParam) : null
      if (this.expenseId) {

        this.depenseService.getDetailExpenseAndDebt(this.expenseId).subscribe({
          next: (response) => {

            this.description = response.expenseData.article
            this.date = response.expenseData.date
            this.initialsPayer = response.expenseData.initials
            this.firstnamePayer = response.expenseData.firstnamePayer
            this.expenseAmount = response.expenseData.expense_amount
            this.debtAmount = response.debtData.debt_amount
            this.debtData = response.debtData.debtData


            this.changeDetectorRef.detectChanges();
            console.log("Données de la dépense bien récupérée")
          },
          error: (err) => {
            console.error("Erreur de récupération des données de la dépense", err)
          }
        })
      }
    })
  }

  deleteExpense() {
    if (!this.groupId || !this.expenseId) {
      return
    }

    this.depenseService.deleteExpense(this.groupId, this.expenseId).subscribe({
      next: () => {


        this.router.navigate(["/depenses/depenses-home", this.groupId])

        console.log("dépense supprimée")
      },
      error: (err) => {
        console.error("Erreur lors de la suppression de la dépense", err)
      }
    }
    )

  }
}
