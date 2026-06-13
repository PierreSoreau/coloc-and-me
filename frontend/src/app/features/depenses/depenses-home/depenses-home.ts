import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { DepensesInput } from '../../../_shared/depenses-input/depenses-input';
import { DepensesService, ExpenseItem } from '../services/depenses.services';
import { GroupService } from '../../group/services/group.services';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, } from '@angular/router';
import { ButtonBack } from '../../../_shared/button/button-back/button-back';

@Component({
  selector: 'app-depenses-home',
  imports: [DepensesInput, RouterLinkActive, RouterLink, ButtonBack],
  templateUrl: './depenses-home.html',
  styleUrl: './depenses-home.scss',
})
export class DepensesHome implements OnInit {
  private route = inject(ActivatedRoute)
  private depenseService = inject(DepensesService)
  private groupService = inject(GroupService)
  private changeDetectorRef = inject(ChangeDetectorRef)
  totalExpenseValue: number = 0;
  totalDebtAmount: number = 0;
  expenseList: ExpenseItem[] = []
  groupId: string | null = null;



  ngOnInit(): void {

    //on chope le groupId de l'url
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get("groupId")
      if (this.groupId) {
        this.groupService.notifyHeaderOfGroupChange(this.groupId)
        this.depenseService.getExpensesData(this.groupId).subscribe({
          next: (response) => {
            this.totalExpenseValue = response.globalStats.totalExpenseGroup
            this.totalDebtAmount = response.globalStats.totalDebt
            this.expenseList = response.finalExpenseList

            this.changeDetectorRef.detectChanges();

          },
          error: (err) => {
            console.error("Erreur de récupération des données de dépenses", err)
          }
        })

      }
      else {
        console.error("Impossible de charger les dépenses : pas d'ID dans l'URL");
      }
    });
  }
}
