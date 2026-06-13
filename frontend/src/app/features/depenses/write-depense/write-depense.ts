import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, groupInitialAndNameResponse } from '../../group/services/group.services';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';
import { ButtonRecord } from '../../../_shared/button/button_record/button-record';
import { DepensesService } from '../services/depenses.services';
import { ButtonBack } from '../../../_shared/button/button-back/button-back';

@Component({
  selector: 'app-write-depense',
  imports: [InputComponent, ReactiveFormsModule, ButtonRecord, ButtonBack],
  templateUrl: './write-depense.html',
  styleUrl: './write-depense.scss',
})
export class WriteDepense implements OnInit {

  private route = inject(ActivatedRoute)
  private groupService = inject(GroupService)
  private depenseService = inject(DepensesService)
  private changeDetectorRef = inject(ChangeDetectorRef)
  private router = inject(Router)
  detailExpenseForm: FormGroup
  groupId: string | null = null
  expenseIdUrl: number | null = null
  expenseId: number = 0
  debtAmount: number = 0
  debtPieceAmount: number = 0
  wrongForm: string = ""
  title: string = "Ex: Courses Monoprix"
  date: string = "jj/mm/aaaa"
  buttonValue: string = "Ajouter la dépense"
  names: groupInitialAndNameResponse[] = []
  descriptionText: string = ""
  montantValue: number = 0.00
  dateValue: string = ""
  payerIdValue: string = ""


  constructor(private fb: FormBuilder) {
    this.detailExpenseForm = this.fb.group({
      description: ['', [Validators.required]],
      montant: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      date: ['', [Validators.required]],
      payerId: ['', [Validators.required]],
      debtUsers: this.fb.array([], [Validators.required])
    })
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      this.groupId = param.get("groupId")
      const expenseParam = param.get("expenseId")

      this.expenseIdUrl = expenseParam !== null ? Number(expenseParam) : null
      if (this.groupId) {
        this.groupService.notifyHeaderOfGroupChange(this.groupId)
        this.groupService.getNamePlusInitials(this.groupId).subscribe({
          next: (response) => {

            this.names = response

            this.changeDetectorRef.detectChanges();

            console.log("Récupération des données des nom des profils faites")
          },

          error: (err) => {
            console.error("Erreur lors de la récupération des données des nom des profils")
          }
        })

      }

      if (this.expenseIdUrl) {
        this.depenseService.getDetailExpenseAndDebt(this.expenseIdUrl).subscribe({
          next: (response) => {

            this.detailExpenseForm.patchValue({
              description: response.expenseData.article,
              montant: response.expenseData.expense_amount,
              date: response.expenseData.date,
              payerId: response.expenseData.payerId
            });
            const debtUsers: FormArray = this.detailExpenseForm.get("debtUsers") as FormArray

            for (const debt of response.debtData.debtData) {
              debtUsers.push(new FormControl(debt.debtUserId))
            }
            this.buttonValue = "Modifier la dépense"
            this.title = ""
            this.date = ""
            this.changeDetectorRef.detectChanges();
          },
          error: (err) => {
            console.error("Erreur lors de la récupération des données des dépenses")
          }
        }
        )


      }
    })

  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.detailExpenseForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

  //fonction qui permet d'enregistrer les nom des personnes cliqué qui doivent de l'argent pour
  //pour la dépense en question
  boxChecked(e: any) {
    //obligé de définir as FormArray sinon c'est AbstractControl pour Angular
    const debtUsers: FormArray = this.detailExpenseForm.get("debtUsers") as FormArray

    //si on a cliqué sur la case du nom de la personne alors
    //on enregistre l'id dans le formulaire
    if (e.target.checked) {
      debtUsers.push(new FormControl(e.target.value))
    }

    //sinon dans le cas ou c'est pas coché ou decoché on le retire du formarray
    else {
      let i: number = 0
      debtUsers.controls.forEach(control => {
        if (control.value === e.target.value) {
          debtUsers.removeAt(i)
          return
        }
        i++
      });
    }
  }

  isDebtUserSelected(userId: string) {
    const userSelected = this.detailExpenseForm.get("debtUsers")?.value || []
    return userSelected.includes(userId)
  }

  setPayer(userId: string) {
    this.detailExpenseForm.get('payerId')?.setValue(userId);

    this.changeDetectorRef.detectChanges();
  }



  onSubmit() {

    if (this.detailExpenseForm.invalid) {
      this.wrongForm = "Tous les champs du formulaire doivent être renseignés"
      return
    }

    const dataExpense = this.detailExpenseForm.value

    if (!this.groupId) {
      return
    }

    if (this.expenseIdUrl) {
      this.depenseService.deleteExpense(this.groupId, this.expenseIdUrl).subscribe({
        next: () => {

          console.log("dépense ultérieure supprimée")
        },
        error: (err) => {
          console.error("Erreur lors de la suppression de la dépense ultérieure", err)
        }
      }
      )


    }


    const newExpense = {
      article: dataExpense.description,
      expense_amount: dataExpense.montant,
      date: dataExpense.date,
      profil_id: dataExpense.payerId,
      groupId: this.groupId
    }


    this.depenseService.newExpense(newExpense).subscribe({
      next: (response) => {
        this.expenseId = response.expense_id
        this.debtAmount = response.debtAmount
        console.log("Enregistrement des données de la nouvelle dépense")

        const debtTable = this.detailExpenseForm.get("debtUsers") as FormArray
        // Arrondit à 2 décimales et le garde en format nombre
        this.debtPieceAmount = Number((this.debtAmount / debtTable?.length).toFixed(2));
        const debtTablevalue = this.detailExpenseForm.get("debtUsers")?.value
        const debtCredential = {
          profilIdTable: debtTablevalue,
          debt_amount: this.debtPieceAmount,
          expenses_id: this.expenseId
        }

        this.depenseService.newDebtData(debtCredential).subscribe({
          next: (response) => {


            console.log("Enregistrement des dettes effectuée", response)
            this.router.navigate(["/depenses/depenses-home", this.groupId])

          },

          error: (error) => {
            console.error("Erreur lors de l'enregistrement des dettes", error)
          }


        })


      },

      error: (error) => {
        console.error("Erreur lors de l'enregistrement des données de la nouvelle dépense", error)
      }


    })




  }
}

