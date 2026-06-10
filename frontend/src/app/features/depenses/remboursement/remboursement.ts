import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { DepensesInput } from '../../../_shared/depenses-input/depenses-input';
import { DepensesService, UserBalanceResponse } from '../services/depenses.services';
import { GroupService } from '../../group/services/group.services';
import { ActivatedRoute, RouterLink, RouterLinkActive, } from '@angular/router';

@Component({
  selector: 'app-remboursement',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './remboursement.html',
  styleUrl: './remboursement.scss',
})
export class Remboursement implements OnInit {
  private depenseService = inject(DepensesService)
  private groupService = inject(GroupService)
  private changeDetectorRef = inject(ChangeDetectorRef)
  private route = inject(ActivatedRoute)
  totalExpenseValue: number = 0;
  totalDebtAmount: number = 0;
  balanceData: UserBalanceResponse[] = []
  groupId: string | null = null;

  ngOnInit(): void {
    //on chope le groupId de l'url
    this.route.paramMap.subscribe((param) => {
      this.groupId = param.get("groupId")
      if (this.groupId) {
        this.groupService.notifyHeaderOfGroupChange(this.groupId)
        this.depenseService.getDebtData(this.groupId).subscribe({
          next: (response) => {
            this.totalExpenseValue = response.totalExpenseGroup
            this.totalDebtAmount = response.totalDebt

            this.changeDetectorRef.detectChanges();

            console.log("Récupération des données de dettes faites")

          },

          error: (error) => {
            console.error("Erreur lors de la récupération des données de dette", error)
          }


        })

        this.depenseService.getallUserBalance(this.groupId).subscribe({
          next: (response) => {
            this.balanceData = response

            this.changeDetectorRef.detectChanges();

            console.log("Récupération des données d'équilibre de dette faites")

          },

          error: (error) => {
            console.error("Erreur lors de la récupération des données d'équilibre de dette", error)
          }


        })

      }
    })
  }
}
