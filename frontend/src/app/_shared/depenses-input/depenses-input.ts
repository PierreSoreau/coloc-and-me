import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-depenses-input',
  imports: [RouterLink, DatePipe],
  templateUrl: './depenses-input.html',
  styleUrl: './depenses-input.scss',
})
export class DepensesInput {
  @Input() linkRedirection: (string | number | null)[] = [];
  @Input() expenseAmount: number = 0
  @Input() expenseDate: string = ""
  @Input() expenseTitle: string = ""
  @Input() firstname: string = ""
  @Input() userInitials: string = ""



}
