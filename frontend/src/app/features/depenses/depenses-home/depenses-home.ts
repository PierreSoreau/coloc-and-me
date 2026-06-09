import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { DepensesInput } from '../../../_shared/depenses-input/depenses-input';
import { DepensesService, ExpenseItem } from '../services/depenses.services';
import { GroupService } from '../../group/services/group.services';
import { RouterLink, RouterLinkActive, } from '@angular/router';

@Component({
  selector: 'app-depenses-home',
  imports: [DepensesInput, RouterLinkActive, RouterLink],
  templateUrl: './depenses-home.html',
  styleUrl: './depenses-home.scss',
})
export class DepensesHome implements OnInit {
  private depenseService = inject(DepensesService)
  private groupService = inject(GroupService)
  private changeDetectorRef = inject(ChangeDetectorRef)
  totalExpenseValue: number = 0;
  totalDebtAmount: number = 0;
  expenseList: ExpenseItem[] = []



  ngOnInit(): void {

    const groupId = this.groupService.getCurrentGroupId();
    if (!groupId) {
      return
    }
    this.depenseService.getExpensesData(groupId).subscribe({
      next: (response) => {
        this.totalExpenseValue = response.globalStats.totalExpenseGroup
        this.totalDebtAmount = response.globalStats.totalDebt
        this.expenseList = response.finalExpenseList
        this.changeDetectorRef.detectChanges();



        console.log("Récupération des données de dépenses faites")
      },
      error: (err) => {
        console.error("Erreur de récupération des données de dépenses", err)
      }
    })

  }




}

