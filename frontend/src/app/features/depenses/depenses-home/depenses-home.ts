import { Component } from '@angular/core';

@Component({
  selector: 'app-depenses-home',
  imports: [],
  templateUrl: './depenses-home.html',
  styleUrl: './depenses-home.scss',
})
export class DepensesHome {
  tabledepense: any = [......]
  tableendette: any = []
  tablecredite: any = []

  selectendetté() {
    for (depense in depenses) {
      if (depense.amount < 0) {
        this.tableendette[] = depense
      }
    }
  }

  selectcredité() {

  }
  //pour chaque amount dépense

}