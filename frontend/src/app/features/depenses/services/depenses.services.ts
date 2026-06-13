import { Injectable, inject } from '@angular/core';
//httpClient permet d'envoyer des requettes http
import { HttpClient } from '@angular/common/http';
//Observable représente le flux de réponse donné par l'api de Node
//tap permet d'agir sur la réponse sans la modifier la stocker par exemple
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';


export interface newDebtCredential {
    profilIdTable: string[]
    debt_amount: number
    expenses_id: number
}

export interface newExpenseCredential {
    article: string
    expense_amount: number
    date: string
    profil_id: string
    groupId: string
}

export interface ExpenseItem {
    expense_amount: number
    expense_date: string
    expense_title: string
    firstname: string
    initials: string
    expense_id: number
}

export interface ExpenseStats {
    totalExpenseGroup: number
    totalDebt: number
}

export interface ExpensesDataResponse {
    globalStats: ExpenseStats
    finalExpenseList: ExpenseItem[]
}

export interface DebtDataResponse {
    totalExpenseGroup: number,
    totalDebt: number
}

export interface UserBalanceResponse {
    debtAmount: number,
    firstname: string,
    initials: string
}

export interface ReimboursementResponse {
    firstname: string,
    initials: string,
    debtAmount: number,
    type_de_dette: string,
}

export interface NewExpenseResponse {
    expense_id: number
    debtAmount: number
}

export interface DetailExpense {
    article: string
    date: string
    expense_amount: number
    initials: string
    firstnamePayer: string
    payerId: string
}

export interface NameUserDebt {
    initials: string
    firstnameUserDebt: string
    debtUserId: string
}

export interface DetailDebt {
    debt_amount: number
    debtData: NameUserDebt[]
}

export interface ExpenseAndDebtDetail {
    expenseData: DetailExpense
    debtData: DetailDebt

}





@Injectable({
    providedIn: 'root',
})

export class DepensesService {
    private http = inject(HttpClient)
    private apiUrl = "http://localhost:4000/api/depenses"

    getExpensesData(groupId: string): Observable<ExpensesDataResponse> {
        return this.http.get<ExpensesDataResponse>(`${this.apiUrl}/details`, {
            params: { groupId: groupId }
        })
    }

    getDebtData(groupId: string): Observable<DebtDataResponse> {
        return this.http.get<DebtDataResponse>(`${this.apiUrl}/debt-data`, {
            params: { groupId: groupId }
        })
    }

    getallUserBalance(groupId: string): Observable<UserBalanceResponse[]> {
        return this.http.get<UserBalanceResponse[]>(`${this.apiUrl}/balance-data`, {
            params: { groupId: groupId }
        })
    }

    getRemboursementForUser(groupId: string): Observable<ReimboursementResponse[]> {
        return this.http.get<ReimboursementResponse[]>(`${this.apiUrl}/reimboursement-data`, {
            params: { groupId: groupId }
        })
    }

    newExpense(credential: newExpenseCredential): Observable<NewExpenseResponse> {
        return this.http.post<NewExpenseResponse>(`${this.apiUrl}/new-expense`, credential, {
            params: { groupId: credential.groupId }
        })
    }

    newDebtData(credential: newDebtCredential): Observable<string> {
        return this.http.post<string>(`${this.apiUrl}/new-debt`, credential)
    }

    getDetailExpenseAndDebt(expenseId: number): Observable<ExpenseAndDebtDetail> {
        return this.http.get<ExpenseAndDebtDetail>(`${this.apiUrl}/detail-expense`, {
            params: { expenseId: expenseId }
        })
    }

    deleteExpense(groupId: string, expenseId: number): Observable<string> {
        return this.http.delete<string>(`${this.apiUrl}/delete-expense`, {
            params: { expenseId: expenseId, groupId: groupId }
        })
    }
}


